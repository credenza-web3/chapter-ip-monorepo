import { z } from 'zod'

export const refreshTokenInputSchema = z.object({
  refreshToken: z.string(),
})
export type TRefreshTokenInput = z.infer<typeof refreshTokenInputSchema>

export const exchangeCodeInputSchema = z.object({
  code: z.string(),
  codeVerifier: z.string(),
  redirectUri: z.string(),
})
export type TExchangeCodeInput = z.infer<typeof exchangeCodeInputSchema>

export const authTokenOutputSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string().optional(),
  idToken: z.string().optional(),
})
export type TAuthTokenOutput = z.infer<typeof authTokenOutputSchema>
