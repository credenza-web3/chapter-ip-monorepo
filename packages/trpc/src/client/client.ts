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

export function createClient(opts: {
  trpcUrl?: string
  headers?: Record<string, string>
  getAccessTokenFn?: () => string | Promise<string>
}) {
  opts.trpcUrl = opts.trpcUrl || 'http://localhost:5001/trpc'

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
