// import { createTRPCProxyClient, httpBatchLink, type TRPCClient } from '@trpc/client'
// import type { AppRouter } from '../server/server' // e.g. copied from backend

// export { type TRPCClient } from '@trpc/client'
// export { type AppRouter } from '../server/server'

// export function createClient(opts: {
//   trpcUrl?: string
//   headers?: Record<string, string>
//   getAccessTokenFn?: () => string
// }): TRPCClient<AppRouter> {
//   opts.trpcUrl = opts.trpcUrl || 'http://localhost:8060/trpc'

//   return createTRPCProxyClient<AppRouter>({
//     links: [
//       httpBatchLink({
//         url: opts.trpcUrl,
//         headers: () => {
//           const headers: Record<string, string> = opts.headers || {}
//           if (opts.getAccessTokenFn && typeof opts.getAccessTokenFn === 'function') {
//             const accessToken = opts.getAccessTokenFn()
//             headers.Authorization = `Bearer ${accessToken}`
//           }

//           return headers
//         },
//       }),
//     ],
//   })
// }

import { createTRPCProxyClient, httpBatchLink, httpSubscriptionLink, splitLink } from '@trpc/client'
import type { AppRouter } from '../server/server'

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
  opts.trpcUrl = opts.trpcUrl || 'http://localhost:5001/trpc'

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
        true: httpSubscriptionLink({
          url: opts.trpcUrl,
          connectionParams: async () => {
            if (opts.getAccessTokenFn && typeof opts.getAccessTokenFn === 'function') {
              const accessToken = await opts.getAccessTokenFn()
              return { Authorization: `Bearer ${accessToken}` }
            }
            return { Authorization: undefined }
          },
        }),
        false: httpBatchLink({
          url: opts.trpcUrl,
          headers: async () => {
            const headers: Record<string, string> = opts.headers || {}
            if (opts.getAccessTokenFn && typeof opts.getAccessTokenFn === 'function') {
              const accessToken = await opts.getAccessTokenFn()
              headers.Authorization = `Bearer ${accessToken}`
            }
            return headers
          },
        }),
      }),
    ],
  })
}
