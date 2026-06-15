import { createClient } from '@repo/trpc/client'
import { authStore } from '$lib'

let client: ReturnType<typeof createClient> | null = null

export function getTrpcClient() {
  if (!client) {
    client = createClient({
      trpcUrl: import.meta.env.VITE_TRPC_URL || 'http://localhost:8060/trpc',
      getAccessTokenFn: () => authStore.state.accessToken ?? '',
    })
  }
  return client
}
