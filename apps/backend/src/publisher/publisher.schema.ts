import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Document } from 'mongoose'

export type TPublisherDocument = HydratedDocument<Publisher>

@Schema({
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
  collection: 'publishers',
})
export class Publisher extends Document {
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
