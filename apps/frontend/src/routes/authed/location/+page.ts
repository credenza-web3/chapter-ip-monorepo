import { configStore, ContractName } from '$lib/stores/config.svelte'
import {
  RECENT_LIMIT,
  buildLocationFindContentInput,
  getRecentLocations,
  parseLocationFilters,
  toLocationItems,
} from './location'

export const load = async ({ parent, url }) => {
  const { trpcClient } = await parent()
  if (!trpcClient) throw new Error('tRPC client is not initialized')

  const contractAddress = configStore.getContractAddress(ContractName.CONTENT_NFT)
  const filters = parseLocationFilters(url.searchParams)
  const [filteredContent, recentContent] = await Promise.all([
    trpcClient.contents.findContent.query(buildLocationFindContentInput(contractAddress, filters)),
    trpcClient.contents.findContent.query({
      ...buildLocationFindContentInput(contractAddress),
      limit: String(RECENT_LIMIT),
    }),
  ])

  return {
    filters,
    locationItems: toLocationItems(filteredContent.items, contractAddress),
    recentLocationItems: getRecentLocations(toLocationItems(recentContent.items, contractAddress)),
  }
}
