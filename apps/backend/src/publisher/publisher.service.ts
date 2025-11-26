import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { CommonModelService } from '../common/model/model.service'
import type { TBuiltPaginationOptions } from '../common/model/model.dto'

import { Publisher } from './publisher.schema'
import type { TGetAllPublishersInput } from './publisher.dto'

@Injectable()
export class PublisherService extends CommonModelService<Publisher> {
  constructor(@InjectModel(Publisher.name) private publisherModel: Model<Publisher>) {
    super(publisherModel)
  }

  buildPaginationOptions(opts: TGetAllPublishersInput): TBuiltPaginationOptions {
    const result = super.buildPaginationOptions(opts)

    if (opts.title) {
      result.query.title = { $regex: opts.title, $options: 'i' }
    }

    return result
  }
}
