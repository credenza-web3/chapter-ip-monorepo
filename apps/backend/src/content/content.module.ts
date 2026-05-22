import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { ContentModelService } from './content-model.service'
import { ContentRouter } from './content.router'
import { ContentSchema, Content } from './content.schema'
import { ContentFileSchema, ContentFile } from './file/file.schema'
import { FileService } from './file/file.service'
import { ContentService } from './content.service'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Content.name, schema: ContentSchema },
      { name: ContentFile.name, schema: ContentFileSchema },
    ]),
  ],
  controllers: [],
  providers: [ContentModelService, ContentService, FileService, ContentRouter],
})
export class ContentModule {}
