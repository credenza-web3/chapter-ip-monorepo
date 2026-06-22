import { configStore, ContractName } from '$lib/stores/config.svelte'
import { buildLikenessFindContentInput, getActiveFilterCount, parseLikenessFilters, toLikenessItems } from './likeness'

export const load = async ({ parent, url }) => {
  const { trpcClient } = await parent()
  if (!trpcClient) throw new Error('tRPC client is not initialized')

  const contractAddress = configStore.getContractAddress(ContractName.CONTENT_NFT)
  const filters = parseLikenessFilters(url.searchParams)
  const { items: contentItems } = await trpcClient.contents.findContent.query(
    buildLikenessFindContentInput(contractAddress, filters),
  )
  const { items: recentContentItems } =
    getActiveFilterCount(filters) > 0
      ? await trpcClient.contents.findContent.query(buildLikenessFindContentInput(contractAddress))
      : { items: contentItems }

  return {
    filters,
    likenessItems: toLikenessItems(contentItems, contractAddress),
    recentLikenessItems: toLikenessItems(recentContentItems, contractAddress),
  }
}
