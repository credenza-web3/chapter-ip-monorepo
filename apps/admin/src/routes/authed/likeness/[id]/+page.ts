import { authStore } from '$lib'
import { createClient } from '@repo/trpc/client'
import type { PageLoad } from './$types'

export const load: PageLoad = async ({ params }) => {
  const contentId = params.id
  const trpcClient = createClient({
    trpcUrl: import.meta.env.VITE_TRPC_URL || 'http://localhost:8060/trpc',
    getAccessTokenFn: () => authStore.state.accessToken!,
  })
  const content = await trpcClient.contents.getContentById.query({
    id: contentId,
  })
  return content
}
