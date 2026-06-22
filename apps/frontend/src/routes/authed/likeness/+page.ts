import { configStore, ContractName } from '$lib/stores/config.svelte'
import {
  RECENT_LIMIT,
  buildLikenessFindContentInput,
  getRecentLikenesses,
  parseLikenessFilters,
  toLikenessItems,
} from './likeness'

export const load = async ({ parent, url }) => {
  const { trpcClient } = await parent()
  if (!trpcClient) throw new Error('tRPC client is not initialized')

  const contractAddress = configStore.getContractAddress(ContractName.CONTENT_NFT)
  const filters = parseLikenessFilters(url.searchParams)
  const [filteredContent, recentContent] = await Promise.all([
    trpcClient.contents.findContent.query(buildLikenessFindContentInput(contractAddress, filters)),
    trpcClient.contents.findContent.query({
      ...buildLikenessFindContentInput(contractAddress),
      limit: String(RECENT_LIMIT),
    }),
  ])

  return {
    filters,
    likenessItems: toLikenessItems(filteredContent.items, contractAddress),
    recentLikenessItems: getRecentLikenesses(toLikenessItems(recentContent.items, contractAddress)),
  }
}
