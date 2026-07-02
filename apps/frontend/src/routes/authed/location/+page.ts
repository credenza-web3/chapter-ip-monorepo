import { configStore, ContractName } from '$lib/stores/config.svelte'
import { RECENT_LIMIT, buildLocationFindContentInput, getRecentLocations, toLocationItems } from './location'

export const load = async ({ parent }) => {
  const { trpcClient } = await parent()
  if (!trpcClient) throw new Error('tRPC client is not initialized')

  const contractAddress = configStore.getContractAddress(ContractName.CONTENT_NFT)
  const [content, recentContent] = await Promise.all([
    trpcClient.contents.findContent.query(buildLocationFindContentInput(contractAddress)),
    trpcClient.contents.findContent.query({
      ...buildLocationFindContentInput(contractAddress),
      limit: String(RECENT_LIMIT),
    }),
  ])

  return {
    locationItems: toLocationItems(content.items, contractAddress),
    recentLocationItems: getRecentLocations(toLocationItems(recentContent.items, contractAddress)),
  }
}
