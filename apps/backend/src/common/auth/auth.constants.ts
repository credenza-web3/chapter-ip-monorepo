export const TOKEN_USE = {
  ID: 'id',
  ACCESS: 'access',
  REFRESH: 'refresh',
} as const

export const CLAIMS = {
  ISSUED_AT: 'iat',
  EXPIRES_AT: 'exp',
  AUDIENCE: 'aud',
  ISSUER: 'iss',
  SUBJECT: 'sub',
  SCOPE: 'scope',
  TOKEN_TYPE: 'token_type',
  TOKEN_USE: 'token_use',
  NONCE: 'nonce',
  LOGIN_TYPE: 'login_type',
  EMAIL: 'email',
  PHONE: 'phone',
  NAME: 'name',
  PICTURE: 'picture',
} as const

export const BEARER_TOKEN = 'Bearer'
