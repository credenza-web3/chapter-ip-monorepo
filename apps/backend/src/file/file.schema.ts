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

  @Prop({ required: true })
  tokenId: string

  createdAt: Date
  updatedAt: Date
}

export const FileSchema = SchemaFactory.createForClass(File)
FileSchema.index({ sub: 1 })
FileSchema.index({ tokenId: 1 }, { unique: true })
FileSchema.index({ key: 1 }, { unique: true })
FileSchema.index({ createdAt: 1 })
FileSchema.index({ updatedAt: 1 })
