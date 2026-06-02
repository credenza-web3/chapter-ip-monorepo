import { z } from 'zod'

export const NOTIFICATION_TYPE = {
  LIKENESS_DRAFT_SAVED: 'LIKENESS_DRAFT_SAVED',
  LIKENESS_PURCHASED: 'LIKENESS_PURCHASED',
  WRITTEN_WORK_DRAFT_SAVED: 'WRITTEN_WORK_DRAFT_SAVED',
  WRITTEN_WORK_PURCHASED: 'WRITTEN_WORK_PURCHASED',
  LOCATION_DRAFT_SAVED: 'LOCATION_DRAFT_SAVED',
  LOCATION_PURCHASED: 'LOCATION_PURCHASED',
  OTHER: 'OTHER',
} as const
export type TNotificationType = typeof NOTIFICATION_TYPE[keyof typeof NOTIFICATION_TYPE]
export const NOTIFICATION_TYPE_VALUES = Object.values(NOTIFICATION_TYPE);

export const notificationSchema = z.object({
  type: z.enum(NOTIFICATION_TYPE_VALUES),
  sub: z.string(),
  title: z.string(),
  message: z.string(),
  payload: z.looseObject({}),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type TNotification = z.infer<typeof notificationSchema>
