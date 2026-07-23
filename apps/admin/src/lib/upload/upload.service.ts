import { createClient, type TRPCClient, type AppRouter } from '@repo/trpc/client'
import { authStore } from '$lib'
import TransactionService from './transaction.service'
import uploadFileToBucket from './file-upload.service'
import { createImagePreview, isPreviewImage } from './image-preview.service'
import { STATUS, type StatusValue } from '../../routes/authed/likeness/constants/constants'

import { r2BaseConfig } from '@repo/fe-services'

export type NamedUpload = {
  file: File
  name: string
}

export type MintContentPrices = {
  oneTimePrice: number
  lifetimePrice?: number
}

type ContentFileReference = {
  id: string
  key: string
}
type UpdateContentMetadataInput = Parameters<TRPCClient<AppRouter>['contents']['updateContentMetadata']['mutate']>[0]

export default class UploadService {
  constructor(private readonly transactionService: TransactionService) {}

  async registerDraftContent({
    metadata,
    tags,
    trpcClient,
  }: {
    metadata: Record<string, unknown>
    tags?: string[]
    trpcClient: TRPCClient<AppRouter>
  }): Promise<{ contentId: string }> {
    const { id } = await trpcClient.contents.registerContent.mutate({
      metadata,
      ...(tags !== undefined ? { tags } : {}),
    } as Parameters<TRPCClient<AppRouter>['contents']['registerContent']['mutate']>[0])

    return { contentId: id }
  }

  async uploadContentFiles({
    contentId,
    uploads,
    trpcClient,
    includePreviews = true,
    withWatermark = true,
  }: {
    contentId: string
    uploads: NamedUpload[]
    trpcClient: TRPCClient<AppRouter>
    includePreviews?: boolean
    withWatermark?: boolean
  }): Promise<{ keys: string[] }> {
    const keys: string[] = []

    for (const { file, name } of uploads) {
      const ext = file.name.split('.').pop() || ''
      const registeredName = ext ? `${name}.${ext}` : name

      const { url, key } = await trpcClient.contents.createContentFileUploadUrl.mutate({
        contentId,
        mimetype: file.type,
        bucket: 'content',
        filename: name,
        extension: ext,
      })
      keys.push(key)
      await uploadFileToBucket(file, url)

      await trpcClient.contents.registerContentFile.mutate({
        contentId,
        key,
        bucket: 'content',
        filename: registeredName,
        mimetype: file.type,
        label: registeredName,
      })

      if (includePreviews && isPreviewImage(file)) {
        try {
          const preview = await createImagePreview(file, { withWatermark })
          const previewExt = preview.name.split('.').pop() || ''
          const { url: previewUrl } = await trpcClient.contents.createContentFileUploadUrl.mutate({
            contentId,
            mimetype: preview.type,
            bucket: 'preview',
            filename: name,
            extension: previewExt,
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
    tags,
    trpcClient,
    includePreviews = true,
    withWatermark = true,
  }: {
    uploads: NamedUpload[]
    metadata: Record<string, unknown>
    tags?: string[]
    trpcClient: TRPCClient<AppRouter>
    includePreviews?: boolean
    withWatermark?: boolean
  }): Promise<{ contentId: string; keys: string[] }> {
    const { contentId } = await this.registerDraftContent({ metadata, tags, trpcClient })
    const { keys } = await this.uploadContentFiles({ contentId, uploads, trpcClient, includePreviews, withWatermark })

    return { contentId, keys }
  }

  async mintContent({ oneTimePrice, lifetimePrice }: MintContentPrices): Promise<string> {
    return await this.transactionService.mintWithPrices(authStore.state.accessToken!, {
      oneTimePrice,
      lifetimePrice,
    })
  }

  async finalizeContent({
    contentId,
    tokenId,
    metadata,
    tags,
    trpcClient,
  }: {
    contentId: string
    tokenId: string
    metadata: Record<string, unknown>
    tags?: string[]
    trpcClient: TRPCClient<AppRouter>
  }): Promise<void> {
    await this.updateContentMetadata({
      contentId,
      metadata,
      tags,
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
    tags,
    trpcClient,
  }: {
    contentId: string
    tokenId?: string
    status?: StatusValue
    metadata?: UpdateContentMetadataInput['metadata']
    tags?: string[]
    trpcClient: TRPCClient<AppRouter>
  }): Promise<void> {
    const input = {
      contentId,
      ...(metadata !== undefined ? { metadata } : {}),
      ...(tags !== undefined ? { tags } : {}),
      ...(tokenId ? { tokenId } : {}),
      ...(status ? { status } : {}),
    } as UpdateContentMetadataInput
    await trpcClient.contents.updateContentMetadata.mutate(input)
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
      metadata: { title, description, keys, image: r2BaseConfig.defaultImageUrl },
      trpcClient,
    })
  }

  async uploadPreviewImage({
    contentId,
    file,
    filename,
    trpcClient,
  }: {
    contentId: string
    file: File
    filename: string
    trpcClient: TRPCClient<AppRouter>
  }): Promise<void> {
    const ext = file.name.split('.').pop() || ''
    const { url, key } = await trpcClient.contents.createContentFileUploadUrl.mutate({
      contentId,
      mimetype: file.type,
      bucket: 'preview',
      filename,
      extension: ext,
    })
    await uploadFileToBucket(file, url)

    const baseName = filename.includes('.') ? filename.slice(0, filename.lastIndexOf('.')) : filename
    const registeredName = ext ? `${baseName}.${ext}` : baseName
    await trpcClient.contents.registerContentFile.mutate({
      contentId,
      key,
      filename: registeredName,
      mimetype: file.type,
      label: registeredName,
      bucket: 'preview',
    })
  }

  createTrpcClient(): TRPCClient<AppRouter> {
    return createClient({
      trpcUrl: import.meta.env.VITE_TRPC_URL || 'http://localhost:8060/trpc',
      getAccessTokenFn: () => authStore.state.accessToken!,
    })
  }
}
