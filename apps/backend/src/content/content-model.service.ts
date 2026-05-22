import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { CommonModelService } from '../common/model/model.service'

import { Content } from './content.schema'
import type { TBuiltPaginationOptions } from '../common/model/model.dto'
import { TFindContentInput } from './content.dto'

@Injectable()
export class ContentModelService extends CommonModelService<Content> {
  constructor(@InjectModel(Content.name) private contentModel: Model<Content>) {
    super(contentModel)
  }

  buildPaginationOptions(opts: TFindContentInput): TBuiltPaginationOptions {
    const result = super.buildPaginationOptions(opts)
    result.query = {
      ...result.query,
      ...(opts.tokenId && { tokenId: opts.tokenId }),
      ...(opts.sub && { sub: opts.sub }),
      ...(opts.contractAddress && { contractAddress: opts.contractAddress }),
    }
    return result
  }
}
