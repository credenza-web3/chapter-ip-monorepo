import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Document, ObjectId } from 'mongoose'

export type TFileDocument = HydratedDocument<File>

@Schema({
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
  collection: 'files',
  toJSON: {
    virtuals: true,
  },
  toObject: {
    virtuals: true,
  },
})
export class File extends Document<ObjectId> {
  declare id: string

  @Prop({ required: true })
  declare sub: string

  @Prop({ required: true })
  declare bucket: string

  @Prop({ required: true })
  declare key: string

  @Prop({ required: true })
  declare tokenId: string

  @Prop({ required: true, lowercase: true, trim: true })
  declare contractAddress: string

  declare createdAt: Date
  declare updatedAt: Date
}

export const FileSchema = SchemaFactory.createForClass(File)
FileSchema.index({ sub: 1 })
FileSchema.index({ key: 1 }, { unique: true })
FileSchema.index({ contractAddress: 1, tokenId: 1 }, { unique: true })
FileSchema.index({ createdAt: 1 })
FileSchema.index({ updatedAt: 1 })
