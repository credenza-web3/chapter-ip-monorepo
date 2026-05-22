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
    trpcClient: any,
  ): Promise<{ contentId: string; tokenId: string; imageUrl: string; key: string }> {
    const tokenId = await this.transactionService.mintWithPrices(
      authStore.state.accessToken!,
      lifetimePrice,
      oneTimePrice,
    )

    const content = await trpcClient.contents.registerContent.mutate({
      tokenId,
      metadata: {},
    })

    // Upload main file
    const { url, key } = await trpcClient.contents.createContentFileUploadUrl.mutate({
      contentId: content.id,
      mimetype: uploaded.type,
    })
    await uploadFileToBucket(uploaded, url)
    await trpcClient.contents.registerContentFile.mutate({
      contentId: content.id,
      key,
      filename: uploaded.name,
      mimetype: uploaded.type,
      bucket: 'content',
    })

    // Upload image if provided
    let imageUrl = r2Config.url
    if (uploadedImage) {
      const { url: imageUrlResponse, key: previewKey } = await trpcClient.contents.createContentFileUploadUrl.mutate({
        contentId: content.id,
        mimetype: uploadedImage.type,
        bucket: 'preview',
      })
      await uploadFileToBucket(uploadedImage, imageUrlResponse)
      imageUrl += previewKey
    } else {
      imageUrl += r2Config.defaultImage
    }

    return { contentId: content.id, tokenId, imageUrl, key }
  }

  async saveMetadata({
    contentId,
    tokenId,
    uploaded,
    imageUrl,
    key,
    title,
    description,
    trpcClient,
  }: {
    contentId: string
    tokenId: string
    uploaded: File
    imageUrl: string
    key: string
    title: string
    description: string
    trpcClient: any
  }): Promise<void> {
    const metadata = {
      name: uploaded.name,
      size: uploaded.size,
      type: uploaded.type,
      key,
      image: imageUrl,
      title,
      description,
    }

    await trpcClient.contents.updateContentMetadata.mutate({
      contentId,
      metadata,
    })

    await trpcClient.contents.uploadTokenMetadata.mutate({
      tokenId,
      metadata,
    })
  }

  createTrpcClient(): any {
    return createClient({
      trpcUrl: import.meta.env.VITE_TRPC_URL || 'http://localhost:8060/trpc',
      getAccessTokenFn: () => authStore.state.accessToken!,
    })
  }
}
