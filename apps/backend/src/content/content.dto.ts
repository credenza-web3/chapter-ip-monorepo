import { z } from 'zod'

import { paginatedRequestWithCursorSchema, createPaginatedResponseSchema } from '../common/model/model.dto'
import { ContentStatus } from './content.schema'

export const contentMetadataRecordSchema = z.record(z.string(), z.any()).optional()

export const uploadTokenMetadataInputSchema = z.object({
  tokenId: z.string(),
  metadata: z
    .object({})
    .catchall(z.any())
    .refine((obj) => Object.keys(obj).length > 0, {
      message: `'metadata' object cannot be empty`,
    }),
})
export type TUploadTokenMetadataInput = z.infer<typeof uploadTokenMetadataInputSchema>

export const uploadTokenMetadataOutputSchema = z.object({
  url: z.string(),
})
export type TUploadTokenMetadataOutput = z.infer<typeof uploadTokenMetadataOutputSchema>

export const presignedPutOutputSchema = z.object({
  url: z.string(),
  key: z.string(),
})
export type TPresignedPutOutput = z.infer<typeof presignedPutOutputSchema>

export const createUserFileUploadUrlInputSchema = z.object({
  filename: z.string(),
  mimetype: z.string(),
  extension: z.string().optional(),
  bucket: z.enum(['userfiles']).default('userfiles'),
})
export type TCreateUserFileUploadUrlInput = z.infer<typeof createUserFileUploadUrlInputSchema>

export const createContentFileUploadUrlInputSchema = z.object({
  contentId: z.string(),
  mimetype: z.string(),
  filename: z.string(),
  bucket: z.enum(['content', 'preview']).default('content'),
})
export type TCreateContentFileUploadUrlInput = z.infer<typeof createContentFileUploadUrlInputSchema>

export const registerContentInputSchema = z.object({
  tokenId: z.string().optional(),
  metadata: contentMetadataRecordSchema,
  status: z.enum(ContentStatus).optional(),
})
export type TRegisterContentInput = z.infer<typeof registerContentInputSchema>

export const registerContentOutputSchema = z.object({
  id: z.string(),
  sub: z.string(),
  tokenId: z.string().optional(),
  contractAddress: z.string(),
  metadata: contentMetadataRecordSchema,
  status: z.enum(ContentStatus),
  createdAt: z.date(),
  updatedAt: z.date(),
})
export type TRegisterContentOutput = z.infer<typeof registerContentOutputSchema>

export const updateContentMetadataInputSchema = z.object({
  contentId: z.string(),
  tokenId: z.string().optional(),
  metadata: contentMetadataRecordSchema,
  status: z.enum(ContentStatus).optional(),
})
export type TUpdateContentMetadataInput = z.infer<typeof updateContentMetadataInputSchema>

export const updateContentMetadataOutputSchema = registerContentOutputSchema
export type TUpdateContentMetadataOutput = z.infer<typeof updateContentMetadataOutputSchema>

export const registerContentFileInputSchema = z.object({
  contentId: z.string(),
  key: z.string(),
  bucket: z.enum(['content', 'preview']).default('content'),
  label: z.string().default(''),
  filename: z.string(),
  mimetype: z.string(),
})
export type TRegisterContentFileInput = z.infer<typeof registerContentFileInputSchema>

export const contentFileOutputSchema = z.object({
  id: z.string(),
  contentId: z.string(),
  label: z.string(),
  filename: z.string(),
  mimetype: z.string(),
  bucket: z.string(),
  key: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
export type TContentFileOutput = z.infer<typeof contentFileOutputSchema>

export const registerContentFileOutputSchema = contentFileOutputSchema
export type TRegisterContentFileOutput = z.infer<typeof registerContentFileOutputSchema>

export const removeContentFileInputSchema = z.object({
  fileId: z.string(),
})
export type TRemoveContentFileInput = z.infer<typeof removeContentFileInputSchema>

export const removeContentFileOutputSchema = z.object({
  ok: z.literal(true),
})
export type TRemoveContentFileOutput = z.infer<typeof removeContentFileOutputSchema>

export const contentOutputSchema = registerContentOutputSchema.extend({
  files: z.array(contentFileOutputSchema),
})
export type TContentOutput = z.infer<typeof contentOutputSchema>

export const findContentInputSchema = paginatedRequestWithCursorSchema.extend({
  sub: z.string().optional(),
  tokenId: z.string().optional(),
  contractAddress: z.string().optional(),
  metadata: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])).optional(),
})
export type TFindContentInput = z.infer<typeof findContentInputSchema>

export const findContentOutputSchema = createPaginatedResponseSchema(registerContentOutputSchema)
export type TFindContentOutput = z.infer<typeof findContentOutputSchema>

export const getContentByIdInputSchema = z.object({
  id: z.string(),
})
export type TGetContentByIdInput = z.infer<typeof getContentByIdInputSchema>

export const getContentByIdOutputSchema = contentOutputSchema
export type TGetContentByIdOutput = z.infer<typeof getContentByIdOutputSchema>

export const getContentFileLinkInputSchema = z
  .object({
    key: z.string().optional(),
    id: z.string().optional(),
    licenseTokenId: z.string().optional(),
  })
  .refine((data) => Boolean(data.id || data.key), {
    message: 'Either `id` or `key` must be provided.',
    path: ['key'],
  })
export type TGetContentFileLinkInput = z.infer<typeof getContentFileLinkInputSchema>

export const getContentFileLinkOutputSchema = z.object({
  url: z.string(),
})
export type TGetContentFileLinkOutput = z.infer<typeof getContentFileLinkOutputSchema>

export const getContentAllFilesLinkInputSchema = z.object({
  contentId: z.string(),
  licenseTokenId: z.string().optional(),
})
export type TGetContentAllFilesLinkInput = z.infer<typeof getContentAllFilesLinkInputSchema>

export const getContentAllFilesLinkOutputSchema = z.object({
  files: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      url: z.string(),
      filename: z.string(),
      mimetype: z.string(),
    }),
  ),
})
export type TGetContentAllFilesLinkOutput = z.infer<typeof getContentAllFilesLinkOutputSchema>

export const requestLazyMintContentTokenInputSchema = z.object({
  uri: z.string(),
  licenseType: z.union([z.literal(0), z.literal(2)]),
})
export type TRequestLazyMintContentTokenInput = z.infer<typeof requestLazyMintContentTokenInputSchema>

export const contentNftLazyMintVoucherSchema = z.object({
  nonce: z.string(),
  price: z.string(),
  priceToken: z.string(),
  licenseInfo: z.string(),
  uri: z.string(),
})

export const requestLazyMintContentTokenOutputSchema = z.object({
  sig: z.string(),
  domain: z.object({
    name: z.string(),
    version: z.string(),
    chainId: z.number(),
    verifyingContract: z.string(),
  }),
  voucher: contentNftLazyMintVoucherSchema,
})
export type TRequestLazyMintContentTokenOutput = z.infer<typeof requestLazyMintContentTokenOutputSchema>

export const getContentStatisticInputSchema = z.object({
  tokenId: z.string(),
})
export type TGetContentStatisticInput = z.infer<typeof getContentStatisticInputSchema>

export const getContentStatisticOutputSchema = z.object({
  tokenId: z.string(),
  boughtLicensesAmount: z.number().int().nonnegative(),
  revenue: z.object({
    fiat: z.string(),
    eth: z.string(),
    token: z.string(),
  }),
})
export type TGetContentStatisticOutput = z.infer<typeof getContentStatisticOutputSchema>

export const purchaseHistoryItemOutputSchema = z.object({
  id: z.string(),
  buyerAddress: z.string(),
  contentId: z.string(),
  licenseType: z.number().int().nonnegative(),
  priceFiat: z.string(),
  priceToken: z.string(),
  priceEther: z.string(),
  currencyTokenContract: z.string(),
  platformFeeAmount: z.string(),
  agencyFeeAmount: z.string(),
  ownerId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
export type TPurchaseHistoryItemOutput = z.infer<typeof purchaseHistoryItemOutputSchema>

export const findPurchaseHistoryInputSchema = paginatedRequestWithCursorSchema.extend({
  contentId: z.string().optional(),
})
export type TFindPurchaseHistoryInput = z.infer<typeof findPurchaseHistoryInputSchema>

export const findPurchaseHistoryOutputSchema = createPaginatedResponseSchema(purchaseHistoryItemOutputSchema)
export type TFindPurchaseHistoryOutput = z.infer<typeof findPurchaseHistoryOutputSchema>

export const getContentConfigOutputSchema = z.object({
  contractAddresses: z.object({
    contentNft: z.string(),
    licenseNft: z.string(),
    membership: z.string(),
  }),
  chainId: z.number().int().positive(),
  env: z.string(),
})
export type TGetContentConfigOutput = z.infer<typeof getContentConfigOutputSchema>
