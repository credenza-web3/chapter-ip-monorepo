import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Document, ObjectId } from 'mongoose'

export type TFileDocument = HydratedDocument<BlockedLicense>

@Schema({
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
  collection: 'blocked_licenses',
  toJSON: {
    virtuals: true,
  },
  toObject: {
    virtuals: true,
  },
})
export class BlockedLicense extends Document<ObjectId> {
  declare id: string

  @Prop({ required: true })
  tokenId: string

  createdAt: Date
  updatedAt: Date
}

export const BlockedLicenseSchema = SchemaFactory.createForClass(BlockedLicense)
BlockedLicenseSchema.index({ tokenId: 1 }, { unique: true })
