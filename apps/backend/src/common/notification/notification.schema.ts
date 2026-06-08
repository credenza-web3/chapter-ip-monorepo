import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Document, ObjectId, Schema as Mongooseschema } from 'mongoose'
import { DateTime } from 'luxon'

import { NOTIFICATION_TYPE_VALUES, type TNotificationType } from '@repo/notifications'

export type TCommonNotificationDocument = HydratedDocument<CommonNotification>

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

  @Prop({ required: false })
  declare title: string

  @Prop({ required: false })
  declare message: string

  @Prop({ required: false, type: Mongooseschema.Types.Mixed })
  declare payload: Record<string, unknown>

  @Prop({ required: false, default: null, type: Date })
  declare readAt: Date | null

  @Prop({ required: false, default: DateTime.utc().plus({ days: 90 }).toJSDate() })
  declare expiresAt: Date

  declare createdAt: Date
  declare updatedAt: Date
}

export const CommonNotificationSchema: Mongooseschema = SchemaFactory.createForClass(CommonNotification)
CommonNotificationSchema.index({ sub: 1 })
CommonNotificationSchema.index({ type: 1 })
CommonNotificationSchema.index({ readAt: 1 })
CommonNotificationSchema.index({ createdAt: 1 })
CommonNotificationSchema.index({ updatedAt: 1 })
CommonNotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })
