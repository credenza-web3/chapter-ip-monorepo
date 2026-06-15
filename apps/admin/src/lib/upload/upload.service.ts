import { createClient, type TRPCClient, type AppRouter } from '@repo/trpc/client'
import { authStore } from '$lib'
import TransactionService from './transaction.service'
import uploadFileToBucket from './file-upload.service'
import { createImagePreview, isPreviewImage } from './image-preview.service'

import { r2Config } from '@repo/fe-services'

export type NamedUpload = {
  file: File
  name: string
}

export default class UploadService {
  constructor(private readonly transactionService: TransactionService) {}
  async uploadContent({
    uploads,
    metadata,
    lifetimePrice,
    oneTimePrice,
    trpcClient,
  }: {
    uploads: NamedUpload[]
    metadata: Record<string, unknown>
    lifetimePrice: number
    oneTimePrice: number
    trpcClient: TRPCClient<AppRouter>
  }): Promise<{ tokenId: string; keys: string[] }> {
    const tokenId = await this.transactionService.mintWithPrices(
      authStore.state.accessToken!,
      lifetimePrice,
      oneTimePrice,
    )
    // Register content
    const { id } = await trpcClient.contents.registerContent.mutate({
      tokenId,
      metadata,
    })

    const keys: string[] = []

    for (const { file, name } of uploads) {
      const { url, key } = await trpcClient.contents.createContentFileUploadUrl.mutate({
        contentId: id,
        mimetype: file.type,
        filename: name,
      })
      keys.push(key)
      await uploadFileToBucket(file, url)

      await trpcClient.contents.registerContentFile.mutate({
        contentId: id,
        key,
        filename: name,
        mimetype: file.type,
        label: name,
      })

      if (isPreviewImage(file)) {
        try {
          const preview = await createImagePreview(file)
          const { url: previewUrl } = await trpcClient.contents.createContentFileUploadUrl.mutate({
            contentId: id,
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

    // Upload preview image if provided
    // let imageUrl = r2Config.url
    // if (uploadedImage) {
    //   const { url: imageUrlResponse } = await trpcClient.files.createContentFileUploadUrl.mutate({
    //     contentId: id,
    //     mimetype: uploadedImage.type,
    //     bucket: 'preview',
    //   })
    //   await uploadFileToBucket(uploadedImage, imageUrlResponse)

    //   let ext = uploadedImage.type.split('/')[1]
    //   if (ext === 'jpeg') ext = 'jpg'
    //   imageUrl += `${import.meta.env.VITE_EVM_CONTENT_NFT_CONTRACT_ADDRESS.toLowerCase()}/${tokenId}.${ext}`
    // } else {
    //   imageUrl += r2Config.defaultImage
    // }

    return { tokenId, keys }
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
    await trpcClient.contents.uploadTokenMetadata.mutate({
      tokenId,
      metadata: {
        title,
        description,
        keys,
        image: r2Config.url + r2Config.defaultImage,
      },
    })
  }

  createTrpcClient(): TRPCClient<AppRouter> {
    return createClient({
      trpcUrl: import.meta.env.VITE_TRPC_URL || 'http://localhost:8060/trpc',
      getAccessTokenFn: () => authStore.state.accessToken!,
    })
  }
}
