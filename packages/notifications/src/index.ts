import { z } from 'zod'

export const NOTIFICATION_TYPE = {
  LIKENESS_DRAFT_SAVED: 'LIKENESS_DRAFT_SAVED',
  LIKENESS_PURCHASED: 'LIKENESS_PURCHASED',
  WRITTEN_WORK_DRAFT_SAVED: 'WRITTEN_WORK_DRAFT_SAVED',
  WRITTEN_WORK_PURCHASED: 'WRITTEN_WORK_PURCHASED',
  LOCATION_DRAFT_SAVED: 'LOCATION_DRAFT_SAVED',
  LOCATION_PURCHASED: 'LOCATION_PURCHASED',
} as const

export const notificationSchema = z.object({
  type: z.enum(Object.values(NOTIFICATION_TYPE)),
  payload: z.object({
    message: z.string(),
  }),
})

// export const notificationDataSchema = z.discriminatedUnion('type', [notificationSchema])
// export type TNotificationData = z.infer<typeof notificationDataSchema>
