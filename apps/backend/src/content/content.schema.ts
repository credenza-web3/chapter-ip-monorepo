import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Document, ObjectId, Schema as Mongooseschema } from 'mongoose'

export enum ContentStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  SALE_DISABLED = 'SALE_DISABLED',
}

export type TContentDocument = HydratedDocument<Content>

@Schema({
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
  collection: 'contents',
  toJSON: {
    virtuals: true,
  },
  toObject: {
    virtuals: true,
  },
})
export class Content extends Document<ObjectId> {
  declare id: string

  @Prop({ required: true })
  declare sub: string

  @Prop({ required: false })
  declare tokenId?: string

  @Prop({ required: true, lowercase: true, trim: true })
  declare contractAddress: string

  @Prop({ type: Mongooseschema.Types.Mixed, default: {} })
  declare metadata: Record<string, unknown>

  @Prop({ required: true, enum: ContentStatus, default: ContentStatus.ACTIVE })
  declare status: ContentStatus

  declare createdAt: Date
  declare updatedAt: Date
}

export const ContentSchema: Mongooseschema = SchemaFactory.createForClass(Content)
ContentSchema.index({ sub: 1 })
ContentSchema.index(
  { contractAddress: 1, tokenId: 1 },
  { unique: true, partialFilterExpression: { tokenId: { $exists: true, $type: 'string' } } },
)
ContentSchema.index({ createdAt: 1 })
ContentSchema.index({ updatedAt: 1 })
ContentSchema.index({ 'metadata.$**': 1 })
