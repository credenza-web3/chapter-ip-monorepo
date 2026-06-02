import { authStore } from '$lib'
import { createClient } from '@repo/trpc/client'
import type { TContentStatistic } from './types'

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
    statistic?: TContentStatistic
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

  const items = await Promise.all(
    paginatedResponse.items.map(async (item) => {
      const statistic = await trpcClient.contents.getContentStatistic.query({
        tokenId: item.tokenId,
      })

      return { ...item, statistic }
    }),
  )

  return { ...paginatedResponse, items }
}
