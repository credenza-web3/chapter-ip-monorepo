export class PaginatedResponseCursor {
  next: string | null

  current: string | null
}

export class PaginatedResponseWithCursor<T> {
  items: T[]
  cursor: PaginatedResponseCursor
}

export class PaginatedRequestWithCursor {
  id?: string

  limit?: string

  cursor?: string

  sort?: string

  order?: 'asc' | 'desc' = 'desc'

  startCreatedAt?: string

  endCreatedAt?: string

  startUpdatedAt?: string

  endUpdatedAt?: string
}

export class BuiltPaginationOptionsDto {
  currentCursor: string | null
  sort: { [key: string]: 1 | -1 }
  limit: number
  query: Record<string, unknown>
}
