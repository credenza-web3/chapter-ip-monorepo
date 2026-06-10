import { configStore, ContractName } from '$lib/stores/config.svelte'
import { toLikenessItems } from './likeness'

export const load = async ({ parent }) => {
  const { trpcClient } = await parent()
  if (!trpcClient) throw new Error('tRPC client is not initialized')

  const { items: contentItems } = await trpcClient.contents.findContent.query({
    contractAddress: configStore.getContractAddress(ContractName.CONTENT_NFT),
    limit: '100',
    sort: 'createdAt',
    order: 'desc',
  })

  return {
    likenessItems: toLikenessItems(contentItems),
  }
}
