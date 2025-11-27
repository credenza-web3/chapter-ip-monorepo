import { z } from 'zod'

import { paginatedRequestWithCursorSchema, createPaginatedResponseSchema } from '../common/model/model.dto'

export const uploadMetadataInputSchema = z.object({
  tokenId: z.string(),
  metadata: z.object({}).catchall(z.any()),
})
export type TUploadMetadataInput = z.infer<typeof uploadMetadataInputSchema>

export const uploadMetadataOutputSchema = z.object({
  url: z.string(),
})
export type TUploadMetadataOutput = z.infer<typeof uploadMetadataOutputSchema>

export const createContentUploadUrlInputSchema = z.object({
  tokenId: z.string(),
  mimetype: z.string(),
  extension: z.string().optional(),
})
export type TCreateContentUploadUrlInput = z.infer<typeof createContentUploadUrlInputSchema>

export const createContentUploadUrlOutputSchema = z.object({
  url: z.string(),
  key: z.string(),
})
export type TCreateContentUploadUrlOutput = z.infer<typeof createContentUploadUrlOutputSchema>

export const registerContentInputSchema = z.object({
  key: z.string(),
  tokenId: z.string(),
})
export type TRegisterContentInput = z.infer<typeof registerContentInputSchema>

export const registerContentOutputSchema = z.object({
  _id: z.string(),
  sub: z.string(),
  bucket: z.string(),
  key: z.string(),
  tokenId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
export type TRegisterContentOutput = z.infer<typeof registerContentOutputSchema>

export const findContentInputSchema = paginatedRequestWithCursorSchema.extend({
  sub: z.string().optional(),
  tokenId: z.string().optional(),
  key: z.string().optional(),
})
export type TFindContentInput = z.infer<typeof findContentInputSchema>

export const findContentOutputSchema = createPaginatedResponseSchema(registerContentOutputSchema)
export type TFindContentOutput = z.infer<typeof findContentOutputSchema>

export const getContentLinkInputSchema = z
  .object({
    key: z.string().optional(),
    _id: z.string().optional(),
  })
  .refine((data) => Boolean(data._id || data.key), {
    message: 'Either `_id` or `key` must be provided.',
    path: ['key'],
  })
export type TGetContentLinkInput = z.infer<typeof getContentLinkInputSchema>

export const getContentLinkOutputSchema = z.object({
  url: z.string(),
})
export type TGetContentLinkOutput = z.infer<typeof getContentLinkOutputSchema>
