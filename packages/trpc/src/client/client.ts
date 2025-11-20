import { createTRPCProxyClient, httpBatchLink } from '@trpc/client'
import type { AppRouter } from '../server/server' // e.g. copied from backend

export function createClient(opts: {
  trpcUrl?: string
  headers?: Record<string, string>
  getAccessTokenFn?: () => string
}) {
  opts.trpcUrl = opts.trpcUrl || 'http://localhost:8060/trpc'

  return createTRPCProxyClient<AppRouter>({
    links: [
      httpBatchLink({
        url: opts.trpcUrl,
        headers: () => {
          const headers: Record<string, string> = opts.headers || {}
          if (opts.getAccessTokenFn && typeof opts.getAccessTokenFn === 'function') {
            const accessToken = opts.getAccessTokenFn()
            headers.Authorization = `Bearer ${accessToken}`
          }

          return headers
        },
      }),
    ],
  })
}
