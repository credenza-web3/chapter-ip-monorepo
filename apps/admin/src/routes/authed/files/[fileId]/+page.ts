import { authStore } from '$lib'
import { createClient } from '@repo/trpc/client'
import type { PageLoad } from './$types'
import { goto } from '$app/navigation'
import { notify, ToastType } from '@repo/ui-components'

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
  console.log('tokenId', tokenId)
  try {
    const metaUri = await contentContract?.tokenURI(String(tokenId))
    console.log('metaUri', metaUri)
    const response = await fetch(metaUri!)
    const metadata: { image: string, title: string } = await response.json()
    return { paginatedResponse, tokenId, metadata, contentContract }
  } catch (error) {
    console.error('Error fetching metadata:', error)
    notify('Outdated contract metadata, we can not display the file details', ToastType.FAIL)
    return goto('/authed/files')
  }
}
