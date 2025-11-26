import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { CommonModelService } from '../common/model/model.service'

import { Publisher } from './publisher.schema'

@Injectable()
export class PublisherService extends CommonModelService<Publisher> {
  constructor(@InjectModel(Publisher.name) private publisherModel: Model<Publisher>) {
    super(publisherModel)
  }
}
