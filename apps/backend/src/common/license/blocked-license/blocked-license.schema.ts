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
  declare tokenId: string

  @Prop({ required: true })
  declare subEvmAddress: string

  @Prop({ required: true })
  declare sub: string

  declare createdAt: Date
  declare updatedAt: Date
}

export const BlockedLicenseSchema = SchemaFactory.createForClass(BlockedLicense)
BlockedLicenseSchema.index({ tokenId: 1 })
BlockedLicenseSchema.index({ subEvmAddress: 1 })
BlockedLicenseSchema.index({ sub: 1 })
