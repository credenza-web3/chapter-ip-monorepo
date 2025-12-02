import { authStore } from '$lib'
import { createClient } from '@repo/trpc/client'

export const load = async ({ params }) => {
  const trpcClient = createClient({
    trpcUrl: import.meta.env.VITE_TRPC_URL || 'http://localhost:8060/trpc',
    getAccessTokenFn: () => authStore.state.accessToken!,
  })

  const { items } = await trpcClient.publishers.findPublishers.query({
    id: params.publisher_id,
  })
  const publisher = items[0]

  const { items: contentItems } = await trpcClient.files.findContent.query({
    sub: publisher.sub,
  })
  console.log(contentItems)
  return { publisher, contentItems }
}
