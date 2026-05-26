import { authStore } from '$lib'
import { createClient } from '@repo/trpc/client'
import type { PageLoad } from './$types'

export const load: PageLoad = async ({ params }) => {
  const trpcClient = createClient({
    trpcUrl: import.meta.env.VITE_TRPC_URL || 'http://localhost:8060/trpc',
    getAccessTokenFn: () => authStore.state.accessToken ?? '',
  })

  return trpcClient.contents.getContentById.query({
    id: params.id,
  })
}
