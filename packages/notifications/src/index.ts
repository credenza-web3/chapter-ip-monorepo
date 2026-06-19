import { z } from 'zod'

export const NOTIFICATION_TYPE = {
  CONTENT_DRAFT_SAVED: 'CONTENT_DRAFT_SAVED',
  LICENSE_PURCHASED: 'LICENSE_PURCHASED',
  LICENSE_SOLD: 'LICENSE_SOLD',
  CONTENT_CREATED: 'CONTENT_CREATED',
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
  payload: z.record(z.string(), z.unknown()),
  readAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
export type TNotification = z.infer<typeof notificationSchema>

export type TNotificationItem = Omit<TNotification, 'createdAt' | 'updatedAt' | 'readAt'> & {
  _id?: string
  createdAt: string
  updatedAt: string
  readAt: string | null
  expiresAt?: string | null
  metadata?: Record<string, unknown>
  profile?: { fullLegalName?: string; stageName?: string; bio?: string }
  attributes?: Record<string, unknown>
  affiliations?: unknown[]
  licensing?: Record<string, unknown>
  uploadsByBucket?: Record<string, unknown>
}
