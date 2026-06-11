import {
  createTRPCProxyClient,
  httpBatchLink,
  splitLink,
  httpSubscriptionLink,
  createWSClient,
  wsLink,
} from '@trpc/client'
import type { AppRouter } from '../server/server' // e.g. copied from backend

export { type TRPCClient } from '@trpc/client'
export { type AppRouter } from '../server/server'

function wsUrlFromHttp(httpUrl: string): string {
  return httpUrl.replace(/^http/, 'ws')
}

async function getAccessTokenOrUndefined(
  getAccessTokenFn?: () => string | Promise<string>,
): Promise<string | undefined> {
  if (getAccessTokenFn && typeof getAccessTokenFn === 'function') {
    return await getAccessTokenFn()
  }
  return undefined
}

export function createClient(opts: {
  trpcUrl?: string
  wsUrl?: string
  headers?: Record<string, string>
  getAccessTokenFn?: () => string | Promise<string>
}) {
  opts.trpcUrl = opts.trpcUrl || 'http://localhost:8060/trpc'

  const trpcHttpUrl = opts.trpcUrl
  const trpcWsUrl = opts.wsUrl || wsUrlFromHttp(trpcHttpUrl)

  // Only create WebSocket client if WebSocket is available (browser)
  // Falls back to httpSubscriptionLink for SSR/Node.js environments
  const subLink =
    typeof WebSocket !== 'undefined'
      ? wsLink<AppRouter>({
          client: createWSClient({
            url: trpcWsUrl,
            lazy: { enabled: true, closeMs: 1000 },
            connectionParams: async () => {
              const accessToken = await getAccessTokenOrUndefined(opts.getAccessTokenFn)
              return { Authorization: accessToken ? `Bearer ${accessToken}` : undefined }
            },
          }),
        })
      : httpSubscriptionLink({
          url: trpcHttpUrl,
          connectionParams: async () => {
            const accessToken = await getAccessTokenOrUndefined(opts.getAccessTokenFn)
            return { Authorization: accessToken ? `Bearer ${accessToken}` : undefined }
          },
        })

  return createTRPCProxyClient<AppRouter>({
    links: [
      splitLink({
        condition: (op) => op.type === 'subscription',
        true: subLink,
        false: httpBatchLink({
          url: trpcHttpUrl,
          headers: async () => {
            const headers: Record<string, string> = opts.headers || {}
            const accessToken = await getAccessTokenOrUndefined(opts.getAccessTokenFn)
            if (accessToken) {
              headers.Authorization = `Bearer ${accessToken}`
            }
            return headers
          },
        }),
      }),
    ],
  })
}
