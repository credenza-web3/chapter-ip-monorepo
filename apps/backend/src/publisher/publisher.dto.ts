import { z } from 'zod'

import { paginatedRequestWithCursorSchema, createPaginatedResponseSchema } from '../common/model/model.dto'

export const setPublisherInputSchema = z.object({
  title: z.string(),
  avatarUrl: z.string().optional(),
})
export type TSetPublisherInput = z.infer<typeof setPublisherInputSchema>

export const setPublisherOutputSchema = z.object({
  _id: z.string(),
  sub: z.string(),
  title: z.string(),
  avatarUrl: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
export type TSetPublisherOutput = z.infer<typeof setPublisherOutputSchema>

export const getPublisherDataInputSchema = z
  .object({
    sub: z.string().optional(),
    _id: z.string().optional(),
  })
  .refine((data) => Boolean(data._id || data.sub), {
    message: 'Either `_id` or `sub` must be provided.',
    path: ['sub'],
  })
export type TGetPublisherDataInput = z.infer<typeof getPublisherDataInputSchema>

export const getPublisherDataOutputSchema = z.object({
  _id: z.string(),
  sub: z.string(),
  title: z.string(),
  avatarUrl: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
export type TGetPublisherDataOutput = z.infer<typeof getPublisherDataOutputSchema>

export const findPublishersInputSchema = paginatedRequestWithCursorSchema.extend({
  title: z.string().optional(),
  sub: z.string().optional(),
})
export type TFindPublishersInput = z.infer<typeof findPublishersInputSchema>

export const publisherItemSchema = z.object({
  _id: z.string(),
  sub: z.string(),
  title: z.string(),
  avatarUrl: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const findPublishersOutputSchema = createPaginatedResponseSchema(publisherItemSchema)
export type TFindPublishersOutput = z.infer<typeof findPublishersOutputSchema>
