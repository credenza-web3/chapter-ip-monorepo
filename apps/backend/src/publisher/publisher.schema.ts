import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Document, ObjectId } from 'mongoose'

export type TPublisherDocument = HydratedDocument<Publisher>

@Schema({
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
  collection: 'publishers',
  toJSON: {
    virtuals: true,
  },
  toObject: {
    virtuals: true,
  },
})
export class Publisher extends Document<ObjectId> {
  declare id: string

  @Prop({ required: true })
  sub: string

  @Prop({ required: true })
  title: string

  @Prop({ required: false })
  avatarUrl?: string

  createdAt: Date
  updatedAt: Date
}

export const PublisherSchema = SchemaFactory.createForClass(Publisher)
PublisherSchema.index({ sub: 1 }, { unique: true })
PublisherSchema.index({ createdAt: 1 })
PublisherSchema.index({ updatedAt: 1 })
PublisherSchema.index({ title: 1 })
