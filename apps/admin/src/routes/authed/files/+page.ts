import { authStore } from '$lib'
import { configStore, ContractName } from '$lib/stores/config.svelte'
import { createClient } from '@repo/trpc/client'
import type { TContentStatistic } from './types'

export const load = async (): Promise<{
  cursor: { next: string | null; current: string | null }
  items: {
    tokenId?: string
    id: string
    sub: string
    contractAddress: string
    createdAt: string
    updatedAt: string
    metadata?: Record<string, any> | undefined
    status: string
    statistic?: TContentStatistic
  }[]
}> => {
  const trpcClient = createClient({
    trpcUrl: import.meta.env.VITE_TRPC_URL || 'http://localhost:8060/trpc',
    getAccessTokenFn: () => authStore.state.accessToken!,
  })
  const config = await trpcClient.contents.config.query()
  configStore.set(config)

  const subRaw = await authStore.getSubFromToken()
  const sub = subRaw ?? undefined
  const paginatedResponse = await trpcClient.contents.findContent.query({
    sub,
    contractAddress: configStore.getContractAddress(ContractName.CONTENT_NFT),
  })

  const items = await Promise.all(
    paginatedResponse.items.map(async (item) => {
      const statistic = await trpcClient.contents.getContentStatistic.query({
        tokenId: item.tokenId!,
      })

      return { ...item, statistic }
    }),
  )

  return { ...paginatedResponse, items }
}
