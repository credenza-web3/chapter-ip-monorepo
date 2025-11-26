import { z } from 'zod'

import { paginatedRequestWithCursorSchema, createPaginatedResponseSchema } from '../common/model/model.dto'

export const fileSchema = z.object({
  filename: z.string(),
  mimetype: z.string(),
  data: z.array(z.number()),
})
export type TFile = z.infer<typeof fileSchema>

export const uploadFileInputSchema = z.object({
  file: fileSchema,
  tokenId: z.string(),
})
export type TUploadFileInput = z.infer<typeof uploadFileInputSchema>

export const uploadFileOutputSchema = z.object({
  _id: z.string(),
  sub: z.string(),
  key: z.string(),
  bucket: z.string(),
  tokenId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
export type TUploadFileOutput = z.infer<typeof uploadFileOutputSchema>

export const getFileLinkInputSchema = z
  .object({
    key: z.string().optional(),
    _id: z.string().optional(),
  })
  .refine((data) => Boolean(data._id || data.key), {
    message: 'Either `_id` or `key` must be provided.',
    path: ['key'],
  })
export type TGetFileLinkInput = z.infer<typeof getFileLinkInputSchema>

export const getFileLinkOutputSchema = z.object({
  url: z.string(),
})
export type TGetFileLinkOutput = z.infer<typeof getFileLinkOutputSchema>

export const createFileUploadUrlInputSchema = z.object({
  filename: z.string(),
  mimetype: z.string().optional(),
})
export type TCreateFileUploadUrlInput = z.infer<typeof createFileUploadUrlInputSchema>

export const createFileUploadUrlOutputSchema = z.object({
  url: z.string(),
  key: z.string(),
  bucket: z.string(),
})
export type TCreateFileUploadUrlOutput = z.infer<typeof createFileUploadUrlOutputSchema>

export const registerUploadedFileInputSchema = z.object({
  key: z.string(),
  bucket: z.string(),
  tokenId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
export type TRegisterUploadedFileInput = z.infer<typeof registerUploadedFileInputSchema>

export const getAllFilesInputSchema = paginatedRequestWithCursorSchema.extend({
  sub: z.string().optional(),
  tokenId: z.string().optional(),
  key: z.string().optional(),
})
export type TGetAllFilesInput = z.infer<typeof getAllFilesInputSchema>

export const getAllFilesOutputSchema = createPaginatedResponseSchema(uploadFileOutputSchema)
export type TGetAllFilesOutput = z.infer<typeof getAllFilesOutputSchema>
