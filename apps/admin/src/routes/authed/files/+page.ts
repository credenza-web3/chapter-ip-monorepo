import { authStore } from '$lib'
import { createClient } from '@repo/trpc/client'

export const load = async () => {
  const trpcClient = createClient({
    trpcUrl: import.meta.env.VITE_TRPC_URL || 'http://localhost:8060/trpc',
    getAccessTokenFn: () => authStore.state.accessToken!,
  })
  const subRaw = await authStore.getSubFromToken()
  const sub = subRaw ?? undefined
  const paginatedResponse = await trpcClient.files.findContent.query({
    sub,
  })

  return { paginatedResponse }
}
