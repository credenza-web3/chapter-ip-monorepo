import type { LikenessDetails, LikenessMetadataInput } from '@repo/content-types/likeness'
import type { AppRouter, TRPCClient } from '@repo/trpc/client'

type ContentTokenMetadata = LikenessMetadataInput | Record<string, unknown>

export type PurchasedContentFile = {
  id?: string
  filename?: string
  label?: string
  mimetype?: string
  key?: string | null
}

export type PurchasedContentToken = {
  id: string
  tokenId: string
  contentTokenId: number
  metadata: ContentTokenMetadata
  files: PurchasedContentFile[]
  licenseType: string
  licenseTokenId: string
  isBlocked: boolean
}

export type ContentFilesLinkClient = {
  contents: Pick<TRPCClient<AppRouter>['contents'], 'getContentAllFilesLink'>
}

export type LikenessPurchaseRow = {
  purchase: PurchasedContentToken
  likeness: LikenessDetails
}
