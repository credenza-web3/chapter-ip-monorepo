import { z } from 'zod'

import { paginatedRequestWithCursorSchema, createPaginatedResponseSchema } from '../common/model/model.dto'

export const contentMetadataRecordSchema = z.record(z.string(), z.any())

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
  extension: z.string().optional(),
  bucket: z.enum(['content', 'preview']).default('content'),
})
export type TCreateContentFileUploadUrlInput = z.infer<typeof createContentFileUploadUrlInputSchema>

export const registerContentInputSchema = z.object({
  tokenId: z.string(),
  metadata: contentMetadataRecordSchema,
})
export type TRegisterContentInput = z.infer<typeof registerContentInputSchema>

export const registerContentOutputSchema = z.object({
  id: z.string(),
  sub: z.string(),
  tokenId: z.string(),
  contractAddress: z.string(),
  metadata: contentMetadataRecordSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
})
export type TRegisterContentOutput = z.infer<typeof registerContentOutputSchema>

export const updateContentMetadataInputSchema = z.object({
  contentId: z.string(),
  metadata: contentMetadataRecordSchema,
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

export const contentOutputSchema = registerContentOutputSchema.extend({
  files: z.array(contentFileOutputSchema),
})
export type TContentOutput = z.infer<typeof contentOutputSchema>

export const findContentInputSchema = paginatedRequestWithCursorSchema.extend({
  sub: z.string().optional(),
  tokenId: z.string().optional(),
  contractAddress: z.string().optional(),
})
export type TFindContentInput = z.infer<typeof findContentInputSchema>

export const findContentOutputSchema = createPaginatedResponseSchema(registerContentOutputSchema)
export type TFindContentOutput = z.infer<typeof findContentOutputSchema>

export const getContentLinkInputSchema = z
  .object({
    key: z.string().optional(),
    id: z.string().optional(),
    licenseTokenId: z.string().optional(),
  })
  .refine((data) => Boolean(data.id || data.key), {
    message: 'Either `id` or `key` must be provided.',
    path: ['key'],
  })
export type TGetContentLinkInput = z.infer<typeof getContentLinkInputSchema>

export const getContentLinkOutputSchema = z.object({
  url: z.string(),
})
export type TGetContentLinkOutput = z.infer<typeof getContentLinkOutputSchema>
