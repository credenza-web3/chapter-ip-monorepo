import { createClient } from '@repo/trpc/client'
import { authStore } from '$lib'
import { uploadFileToBucket, TransactionService } from '../services'

export class UploadService {
  transactionService: TransactionService
  constructor() {
    this.transactionService = new TransactionService()
  }
  async uploadContent(
    uploaded: File,
    uploadedImage: File | null,
    lifetimePrice: number,
    oneTimePrice: number,
    trpcClient: any
  ): Promise<{ tokenId: string; imageUrl: string; key: string }> {

    const tokenId = await this.transactionService.mintWithPrices(authStore.state.accessToken!, lifetimePrice, oneTimePrice)
    
    // Upload main file
    const { url, key } = await trpcClient.files.createContentUploadUrl.mutate({
      tokenId,
      mimetype: uploaded.type,
    })
    await uploadFileToBucket(uploaded, url)
    // Upload image if provided
    let imageUrl = 'https://pub-1a5fde2f5a814d7bbcaca6562a705028.r2.dev/chapter_ip.png'
    if (uploadedImage) {
      const { url: imageUrlResponse } = await trpcClient.files.createContentUploadUrl.mutate({
        tokenId,
        mimetype: uploadedImage.type,
        bucket: "preview"
      })
      await uploadFileToBucket(uploadedImage, imageUrlResponse)
      imageUrl = imageUrlResponse.split('?')[0]
    }
    
    // Register content
    await trpcClient.files.registerContent.mutate({
      tokenId,
      key,
    })
    
    return { tokenId, imageUrl, key }
  }

  async saveMetadata(
    tokenId: string,
    uploaded: File,
    imageUrl: string,
    key: string,
    trpcClient: any
  ): Promise<void> {
    await trpcClient.files.uploadMetadata.mutate({
      tokenId,
      metadata: {
        name: uploaded.name,
        size: uploaded.size,
        type: uploaded.type,
        key,
        image: imageUrl,
      },
    })
  }

  createTrpcClient(): any {
    return createClient({
      trpcUrl: import.meta.env.VITE_TRPC_URL || 'http://localhost:8060/trpc',
      getAccessTokenFn: () => authStore.state.accessToken!,
    })
  }
}
