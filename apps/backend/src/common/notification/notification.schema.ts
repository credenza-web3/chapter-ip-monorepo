import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Document, ObjectId, Schema as MongooseSchema } from 'mongoose'

import { NOTIFICATION_TYPE_VALUES, type TNotificationType } from '@repo/notifications'

export type TPublisherDocument = HydratedDocument<CommonNotification>

@Schema({
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
  collection: 'notifications',
  toJSON: {
    virtuals: true,
  },
  toObject: {
    virtuals: true,
  },
})
export class CommonNotification extends Document<ObjectId> {
  declare id: string

  @Prop({ required: true, enum: NOTIFICATION_TYPE_VALUES as readonly TNotificationType[] })
  declare type: TNotificationType

  @Prop({ required: true })
  declare sub: string

  @Prop({ required: true })
  declare title: string

  @Prop({ required: false })
  declare message: string

  @Prop({ required: false, type: MongooseSchema.Types.Mixed })
  declare payload: Record<string, unknown>

  @Prop({ required: false, default: null, type: Date })
  declare readAt: Date | null

  declare createdAt: Date
  declare updatedAt: Date
}

export const CommonNotificationSchema = SchemaFactory.createForClass(CommonNotification)
CommonNotificationSchema.index({ sub: 1 })
CommonNotificationSchema.index({ type: 1 })
CommonNotificationSchema.index({ readAt: 1 })
CommonNotificationSchema.index({ createdAt: 1 })
CommonNotificationSchema.index({ updatedAt: 1 })
