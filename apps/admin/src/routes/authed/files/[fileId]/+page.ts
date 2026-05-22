import { authStore } from '$lib'
import { createClient } from '@repo/trpc/client'
import type { PageLoad } from './$types'
import { goto } from '$app/navigation'
import { notify, ToastType } from '@repo/ui-components'
import { addToRecent } from '../helper'

export const load: PageLoad = async ({ params, parent }) => {
  const { contentContract } = await parent()
  const contentId = params.fileId

  const trpcClient = createClient({
    trpcUrl: import.meta.env.VITE_TRPC_URL || 'http://localhost:8060/trpc',
    getAccessTokenFn: () => authStore.state.accessToken!,
  })

  const content = await trpcClient.contents.getContentById.query({
    id: contentId,
  })
  const tokenId = content.tokenId
  try {
    const metaUri = await contentContract?.tokenURI(String(tokenId))
    const response = await fetch(metaUri!)
    const metadata: { image: string; title: string; description: string } = await response.json()

    // Add to recent files
    addToRecent(contentId, metadata.title || 'Untitled', metadata.description || '', metadata.image)

    return { content, contentId, tokenId, metadata, contentContract }
  } catch (error) {
    console.error('Error fetching metadata:', error)
    notify('Outdated contract metadata, we can not display the file details', ToastType.FAIL)
    return goto('/authed/files')
  }
}
