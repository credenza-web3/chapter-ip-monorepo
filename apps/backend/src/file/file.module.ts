import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { FileService } from './file.service'
import { FileRouter } from './file.router'
import { FileSchema, File } from './file.schema'

@Module({
  imports: [MongooseModule.forFeature([{ name: File.name, schema: FileSchema }])],
  controllers: [],
  providers: [FileService, FileRouter],
})
export class FileModule {}
