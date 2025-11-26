import { z } from 'zod'

export const healthOutputSchema = z.object({
  status: z.string(),
  timestamp: z.string(),
  requestId: z.string(),
})
export type THealthOutput = z.infer<typeof healthOutputSchema>
