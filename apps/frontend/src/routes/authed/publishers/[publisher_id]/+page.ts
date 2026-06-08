import { configStore, ContractName } from '$lib/stores/config.svelte'

export const load = async ({ params, parent }) => {
  const { trpcClient } = await parent()

  const publisher = await trpcClient!.publishers.getPublisher.query({
    id: params.publisher_id,
  })

  const { items: contentItems } = await trpcClient!.contents.findContent.query({
    sub: publisher.sub,
    contractAddress: configStore.getContractAddress(ContractName.CONTENT_NFT),
  })

  return { publisher, contentItems }
}
