import { z } from 'zod'

export const paginatedResponseCursorSchema = z.object({
  next: z.string().nullable(),
  current: z.string().nullable(),
})
export type PaginatedResponseCursor = z.infer<typeof paginatedResponseCursorSchema>

export const paginatedRequestWithCursorSchema = z.object({
  id: z.string().optional(),
  limit: z.string().optional(),
  cursor: z.string().optional(),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
  startCreatedAt: z.string().optional(),
  endCreatedAt: z.string().optional(),
  startUpdatedAt: z.string().optional(),
  endUpdatedAt: z.string().optional(),
})
export type PaginatedRequestWithCursor = z.infer<typeof paginatedRequestWithCursorSchema>

export const createPaginatedResponseSchema = <T extends z.ZodType>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    cursor: paginatedResponseCursorSchema,
  })

export type PaginatedResponseWithCursor<T> = {
  items: T[]
  cursor: PaginatedResponseCursor
}

export type BuiltPaginationOptionsDto = {
  currentCursor: string | null
  sort: Record<string, 1 | -1>
  limit: number
  query: Record<string, unknown>
}
