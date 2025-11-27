import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { PublisherService } from './publisher.service'
import { PublisherRouter } from './publisher.router'
import { PublisherSchema, Publisher } from './publisher.schema'

@Module({
  imports: [MongooseModule.forFeature([{ name: Publisher.name, schema: PublisherSchema }])],
  controllers: [],
  providers: [PublisherService, PublisherRouter],
  exports: [PublisherService],
})
export class PublisherModule {}
