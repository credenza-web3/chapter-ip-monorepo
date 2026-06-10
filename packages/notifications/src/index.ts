import { z } from 'zod'

export const NOTIFICATION_TYPE = {
  CONTENT_DRAFT_SAVED: 'CONTENT_DRAFT_SAVED',
  LICENSE_PURCHASED: 'LICENSE_PURCHASED',
  CONTENT_CREATED: 'CONTENT_PURCHASED',
  OTHER: 'OTHER',
} as const
export type TNotificationType = (typeof NOTIFICATION_TYPE)[keyof typeof NOTIFICATION_TYPE]
export const NOTIFICATION_TYPE_VALUES = Object.values(NOTIFICATION_TYPE)

export const notificationSchema = z.object({
  id: z.string(),
  type: z.enum(NOTIFICATION_TYPE_VALUES),
  sub: z.string(),
  title: z.string().optional(),
  message: z.string().optional(),
  payload: z.looseObject({}),
  readAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})


export type TNotification = z.infer<typeof notificationSchema>

export type TNotificationItem = Omit<TNotification, 'createdAt' | 'updatedAt' | 'readAt'> & {
  createdAt: string
  updatedAt: string
  readAt: string | null
}

