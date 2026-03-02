import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { CommonModelService } from '../common/model/model.service'
import type { TBuiltPaginationOptions } from '../common/model/model.dto'

import { Publisher } from './publisher.schema'
import type { TFindPublishersInput } from './publisher.dto'

@Injectable()
export class PublisherService extends CommonModelService<Publisher> {
  constructor(@InjectModel(Publisher.name) private publisherModel: Model<Publisher>) {
    super(publisherModel)
  }

  buildPaginationOptions(opts: TFindPublishersInput): TBuiltPaginationOptions {
    const result = super.buildPaginationOptions(opts)
    result.query = {
      ...result.query,
      ...(opts.title && { title: { $regex: opts.title, $options: 'i' } }),
      ...(opts.sub && { sub: opts.sub }),
      ...(opts.addresses?.length && {
      evmAddress: { $in: opts.addresses.map((a) => a.toLowerCase()) },
    }),
    }
    return result
  }
}
