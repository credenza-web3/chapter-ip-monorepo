import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Document } from 'mongoose'

export type TFileDocument = HydratedDocument<File>

@Schema({
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
  collection: 'files',
})
export class File extends Document {
  @Prop({ required: true })
  sub: string

  @Prop({ required: true })
  bucket: string

  @Prop({ required: true })
  key: string
}

export const FileSchema = SchemaFactory.createForClass(File)
FileSchema.index({ sub: 1 })
FileSchema.index({ key: 1 }, { unique: true })
