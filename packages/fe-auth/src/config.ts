import type { TAuthConfig } from './types'

export function getAuthConfig(env: Record<string, string>): TAuthConfig {
  return {
    accountsUri: env.VITE_ACCOUNTS_URL,
    oauthUri: env.VITE_CREDENZA_OAUTH_URI,
    clientId: env.VITE_CLIENT_ID,
    scopes: 'offline.access openid profile profile.write email phone blockchain.evm.write blockchain.evm',
    redirectPath: '/auth/callback',
    trpcUri: env.VITE_TRPC_URL,
  }
}
