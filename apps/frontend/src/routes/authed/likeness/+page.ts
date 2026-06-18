import { configStore, ContractName } from '$lib/stores/config.svelte'
import { parseLikenessFilters, toLikenessItems } from './likeness'

export const load = async ({ parent, url }) => {
  const { trpcClient } = await parent()
  if (!trpcClient) throw new Error('tRPC client is not initialized')

  const contractAddress = configStore.getContractAddress(ContractName.CONTENT_NFT)
  const { items: contentItems } = await trpcClient.contents.findContent.query({
    contractAddress,
    metadata: { type: 'likeness' },
    limit: '100',
    sort: 'createdAt',
    order: 'desc',
  })

  return {
    filters: parseLikenessFilters(url.searchParams),
    likenessItems: toLikenessItems(contentItems, contractAddress),
  }
}
