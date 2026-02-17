import { authStore } from '$lib'
import { createClient } from '@repo/trpc/client'
import type { PageLoad } from './$types'

export const load: PageLoad = async ({ params, parent }) => {
  const { contentContract } = await parent()
  const fileId = params.fileId

  const trpcClient = createClient({
    trpcUrl: import.meta.env.VITE_TRPC_URL || 'http://localhost:8060/trpc',
    getAccessTokenFn: () => authStore.state.accessToken!,
  })
  const subRaw = await authStore.getSubFromToken()
  const sub = subRaw ?? undefined

  const paginatedResponse = await trpcClient.files.findContent.query({
    sub,
    id: fileId,
  })
  const tokenId = paginatedResponse.items[0].tokenId

  const metaUri = await contentContract?.tokenURI(String(tokenId))
  const response = await fetch(metaUri!)
  const metadata: { image: string, title: string } = await response.json()

  return { paginatedResponse, tokenId, metadata, contentContract }
}
