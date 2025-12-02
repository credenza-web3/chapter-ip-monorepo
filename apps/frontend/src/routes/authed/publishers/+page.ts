import { authStore } from '$lib'
import { createClient } from '@repo/trpc/client'

export const load = async () => {
  const trpcClient = createClient({
    trpcUrl: import.meta.env.VITE_TRPC_URL || 'http://localhost:8060/trpc',
    getAccessTokenFn: () => authStore.state.accessToken!,
  })

  const { items } = await trpcClient.publishers.findPublishers.query({
    limit: '10',
  })

  return { publishers: items }
}
