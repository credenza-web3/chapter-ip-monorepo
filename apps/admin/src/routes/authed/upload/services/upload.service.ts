import { createClient } from '@repo/trpc/client'
import { authStore } from '$lib'
import { uploadFileToBucket, TransactionService } from '../services'
import { r2Config } from '@repo/fe-services'

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
    let imageUrl = r2Config.url
    if (uploadedImage) {
      const { url: imageUrlResponse } = await trpcClient.files.createContentUploadUrl.mutate({
        tokenId,
        mimetype: uploadedImage.type,
        bucket: "preview"
      })
      await uploadFileToBucket(uploadedImage, imageUrlResponse)

      let ext = uploadedImage.type.split('/')[1]
      if (ext === 'jpeg')
        ext = 'jpg'
      imageUrl += `${tokenId}.${ext}`
    } else {
      imageUrl += r2Config.defaultImage
    }
    
    // Register content
    await trpcClient.files.registerContent.mutate({
      tokenId,
      key,
    })
    
    return { tokenId, imageUrl, key }
  }

  async saveMetadata({ 
    tokenId,
    uploaded,
    imageUrl,
    key,
    title,
    trpcClient
  }: {
    tokenId: string,
    uploaded: File,
    imageUrl: string,
    key: string,
    title: string,
    trpcClient: any
  }): Promise<void> {
    await trpcClient.files.uploadMetadata.mutate({
      tokenId,
      metadata: {
        name: uploaded.name,
        size: uploaded.size,
        type: uploaded.type,
        key,
        image: imageUrl,
        title,
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
