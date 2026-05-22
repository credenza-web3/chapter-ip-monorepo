import { createClient, type TRPCClient, type AppRouter } from '@repo/trpc/client'
import { authStore } from '$lib'
import { uploadFileToBucket, TransactionService } from './index'
// import { r2Config } from '@repo/fe-services'

export class UploadService {
  transactionService: TransactionService
  constructor() {
    this.transactionService = new TransactionService()
  }
  async uploadContent({
    uploads,
    metadata,
    lifetimePrice,
    oneTimePrice,
    trpcClient,
  }: {
    uploads: File[]
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

    for (let i = 0; i < uploads.length; i++) {
      const file = uploads[i]
      const { url, key } = await trpcClient.contents.createContentFileUploadUrl.mutate({
        contentId: id,
        mimetype: file.type,
      })
      keys.push(key)
      await uploadFileToBucket(file, url)

      await trpcClient.contents.registerContentFile.mutate({
        contentId: id,
        key,
        filename: file.name,
        mimetype: file.type,
      })
    }

    // Upload image if provided
    // let imageUrl = r2Config.url
    // if (uploadedImage) {
    //   const { url: imageUrlResponse } = await trpcClient.files.createContentUploadUrl.mutate({
    //     tokenId,
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
