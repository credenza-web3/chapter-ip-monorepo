import { authStore } from '$lib'
import { createClient } from '@repo/trpc/client'

export const load = async (): Promise<{
  cursor: { next: string | null; current: string | null }
  items: {
    tokenId: string
    id: string
    sub: string
    contractAddress: string
    createdAt: string
    updatedAt: string
    metadata?: Record<string, any> | undefined
  }[]
}> => {
  const trpcClient = createClient({
    trpcUrl: import.meta.env.VITE_TRPC_URL || 'http://localhost:8060/trpc',
    getAccessTokenFn: () => authStore.state.accessToken!,
  })
  const subRaw = await authStore.getSubFromToken()
  const sub = subRaw ?? undefined
  const paginatedResponse = await trpcClient.contents.findContent.query({
    sub,
    contractAddress: import.meta.env.VITE_CONTENT_CONTRACT_ADDRESS,
  })

  return { ...paginatedResponse }
}
