import { z } from 'zod'

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

export const getPublisherDataInputSchema = z.object({
  sub: z.string(),
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
