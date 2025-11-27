import type { Model } from 'mongoose'
import { BadRequestException } from '@nestjs/common'

import type { TPaginatedRequestWithCursor, TPaginatedResponseWithCursor, TBuiltPaginationOptions } from './model.dto'

export class CommonModelService<T> {
  constructor(protected model: Model<T>) {}

  getModel() {
    return this.model
  }

  buildPaginationOptions(opts: TPaginatedRequestWithCursor): TBuiltPaginationOptions {
    const limit = opts.limit ? parseInt(opts.limit) : 50
    if (limit > 100) {
      throw new BadRequestException('Limit must be less than 100')
    }
    const sortBy = opts.sort || '_id'
    const sortOrder = opts.order === 'asc' ? 1 : -1
    const cursorDirection = opts.order === 'asc' ? '$gt' : '$lt'

    return {
      currentCursor: opts.cursor || null,
      sort: { [sortBy]: sortOrder },
      limit,
      query: <TBuiltPaginationOptions['query']>{
        ...(opts.cursor && { [sortBy]: { [cursorDirection]: Buffer.from(opts.cursor, 'hex').toString('utf8') } }),
        ...(opts.id && { _id: opts.id }),
        ...(opts.startCreatedAt && { createdAt: { $gte: opts.startCreatedAt } }),
        ...(opts.endCreatedAt && { createdAt: { $lte: opts.endCreatedAt } }),
        ...(opts.startUpdatedAt && { createdAt: { $gte: opts.startUpdatedAt } }),
        ...(opts.endUpdatedAt && { createdAt: { $lte: opts.endUpdatedAt } }),
      },
    }
  }

  async paginate<T>(opts: TBuiltPaginationOptions): Promise<TPaginatedResponseWithCursor<T>> {
    const items = await this.model
      .find(opts.query)
      .sort(opts.sort)
      .limit(opts.limit + 1)
      .lean()
    const hasNextPage = items.length > opts.limit
    const results = hasNextPage ? items.slice(0, -1) : items
    const lastItem = results[results.length - 1]

    const cursorField = opts.sort ? Object.keys(opts.sort)[0] : '_id'
    const nextCursor = hasNextPage ? Buffer.from(String(lastItem[cursorField])).toString('hex') : null

    return {
      items: results.map((item) => ({ ...item, id: String(item._id) })) as T[],
      cursor: {
        current: opts.currentCursor,
        next: nextCursor,
      },
    }
  }
}
