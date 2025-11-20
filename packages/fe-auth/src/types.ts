export type TAuthStore = {
  accessToken: string | null
  refreshToken: string | null
  isLoading: boolean
  error: string | null
  isInitialized: boolean
}

export type TTokenResponse = {
  accessToken: string
  refreshToken: string
  expiresIn?: number
}

export type TAuthConfig = {
  oauthUri: string
  clientId: string
  scopes: string
  redirectPath?: string
  trpcUri?: string
}

export type TExchangeCodeInput = {
  code: string
  redirectUri: string
  codeVerifier: string
}

export type TRefreshTokenInput = {
  refreshToken: string
}
