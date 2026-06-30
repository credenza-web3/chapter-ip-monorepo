import { createClient, type TRPCClient, type AppRouter } from '@repo/trpc/client'
import { authStore } from '$lib'
import TransactionService from './transaction.service'
import uploadFileToBucket from './file-upload.service'
import { createImagePreview, isPreviewImage } from './image-preview.service'
import { STATUS, type StatusValue } from '../../routes/authed/likeness/constants/constants'

import { r2Config } from '@repo/fe-services'

export type NamedUpload = {
  file: File
  name: string
}

type ContentMetadata = Record<string, any>
type ContentFileReference = {
  id: string
  key: string
}

function getTokenMetadata(metadata: ContentMetadata | undefined, keys: string[]) {
  const profile = metadata?.profile ?? {}
  const stageName = profile.stageName

  return {
    title: `${profile.fullLegalName ?? 'Untitled'} ${stageName ? `(${stageName})` : ''}`.trim(),
    description: profile.bio ?? '',
    keys,
    image: r2Config.url + r2Config.defaultImage,
  }
}

function getLicensePrice(metadata: ContentMetadata | undefined, key: 'perpetual' | 'single-use'): number {
  return Number(metadata?.licensing?.licensePrices?.[key] ?? 0)
}

export default class UploadService {
  constructor(private readonly transactionService: TransactionService) {}

  async registerDraftContent({
    metadata,
    trpcClient,
  }: {
    metadata: Record<string, unknown>
    trpcClient: TRPCClient<AppRouter>
  }): Promise<{ contentId: string }> {
    const { id } = await trpcClient.contents.registerContent.mutate({
      metadata,
    })

    return { contentId: id }
  }

  async uploadContentFiles({
    contentId,
    uploads,
    trpcClient,
    includePreviews = true,
  }: {
    contentId: string
    uploads: NamedUpload[]
    trpcClient: TRPCClient<AppRouter>
    includePreviews?: boolean
  }): Promise<{ keys: string[] }> {
    const keys: string[] = []

    for (const { file, name } of uploads) {
      const { url, key } = await trpcClient.contents.createContentFileUploadUrl.mutate({
        contentId,
        mimetype: file.type,
        filename: name,
      })
      keys.push(key)
      await uploadFileToBucket(file, url)

      await trpcClient.contents.registerContentFile.mutate({
        contentId,
        key,
        filename: name,
        mimetype: file.type,
        label: name,
      })

      if (includePreviews && isPreviewImage(file)) {
        try {
          const preview = await createImagePreview(file)
          const { url: previewUrl } = await trpcClient.contents.createContentFileUploadUrl.mutate({
            contentId,
            mimetype: preview.type,
            bucket: 'preview',
            filename: name,
          })
          await uploadFileToBucket(preview, previewUrl)
        } catch (error) {
          console.error(`Failed to upload preview for ${file.name}`, error)
        }
      }
    }

    return { keys }
  }

  async updateContentFiles({
    contentId,
    currentFiles,
    keptFileIds,
    uploads,
    trpcClient,
  }: {
    contentId: string
    currentFiles: ContentFileReference[]
    keptFileIds: Set<string>
    uploads: NamedUpload[]
    trpcClient: TRPCClient<AppRouter>
  }): Promise<{ keys: string[] }> {
    const keys = currentFiles.filter((file) => keptFileIds.has(file.id)).map((file) => file.key)

    for (const file of currentFiles) {
      if (!keptFileIds.has(file.id)) {
        await trpcClient.contents.removeContentFile.mutate({ fileId: file.id })
      }
    }

    const uploaded = await this.uploadContentFiles({
      contentId,
      uploads,
      trpcClient,
      includePreviews: false,
    })

    return { keys: [...keys, ...uploaded.keys] }
  }

  async saveDraftContent({
    uploads,
    metadata,
    trpcClient,
  }: {
    uploads: NamedUpload[]
    metadata: Record<string, unknown>
    trpcClient: TRPCClient<AppRouter>
  }): Promise<{ contentId: string; keys: string[] }> {
    const { contentId } = await this.registerDraftContent({ metadata, trpcClient })
    const { keys } = await this.uploadContentFiles({ contentId, uploads, trpcClient })

    return { contentId, keys }
  }

  async mintContent({ lifetimePrice, oneTimePrice }: { lifetimePrice: number; oneTimePrice: number }): Promise<string> {
    return await this.transactionService.mintWithPrices(authStore.state.accessToken!, lifetimePrice, oneTimePrice)
  }

  async finalizeContent({
    contentId,
    tokenId,
    metadata,
    trpcClient,
  }: {
    contentId: string
    tokenId: string
    metadata: Record<string, unknown>
    trpcClient: TRPCClient<AppRouter>
  }): Promise<void> {
    await this.updateContentMetadata({
      contentId,
      metadata,
      tokenId,
      status: STATUS.ACTIVE,
      trpcClient,
    })
  }

  async updateContentMetadata({
    contentId,
    tokenId,
    status,
    metadata,
    trpcClient,
  }: {
    contentId: string
    tokenId?: string
    status?: StatusValue
    metadata: Record<string, unknown>
    trpcClient: TRPCClient<AppRouter>
  }): Promise<void> {
    await trpcClient.contents.updateContentMetadata.mutate({
      contentId,
      metadata,
      ...(tokenId ? { tokenId } : {}),
      ...(status ? { status: status as any } : {}),
    })
  }

  async activateDraftContent({
    contentId,
    trpcClient,
  }: {
    contentId: string
    trpcClient: TRPCClient<AppRouter>
  }): Promise<void> {
    const content = await trpcClient.contents.getContentById.query({ id: contentId })
    const metadata = (content.metadata ?? {}) as ContentMetadata
    const tokenId = await this.mintContent({
      lifetimePrice: getLicensePrice(metadata, 'perpetual'),
      oneTimePrice: getLicensePrice(metadata, 'single-use'),
    })
    await this.finalizeContent({ contentId, metadata, tokenId, trpcClient })
    await this.uploadTokenMetadata({
      tokenId,
      metadata: getTokenMetadata(
        metadata,
        content.files.filter((file) => file.bucket === 'content').map((file) => file.key),
      ),
      trpcClient,
    })
  }

  async uploadTokenMetadata({
    tokenId,
    metadata,
    trpcClient,
  }: {
    tokenId: string
    metadata: Record<string, unknown>
    trpcClient: TRPCClient<AppRouter>
  }): Promise<void> {
    await trpcClient.contents.uploadTokenMetadata.mutate({
      tokenId,
      metadata,
    })
  }

  async saveMetadata({
    tokenId,
    title,
    description,
    trpcClient,
    keys,
  }: {
    tokenId: string
    title: string
    keys: string[]
    description: string
    trpcClient: TRPCClient<AppRouter>
  }): Promise<void> {
    await this.uploadTokenMetadata({
      tokenId,
      metadata: { title, description, keys, image: r2Config.url + r2Config.defaultImage },
      trpcClient,
    })
  }

  createTrpcClient(): TRPCClient<AppRouter> {
    return createClient({
      trpcUrl: import.meta.env.VITE_TRPC_URL || 'http://localhost:8060/trpc',
      getAccessTokenFn: () => authStore.state.accessToken!,
    })
  }
}
