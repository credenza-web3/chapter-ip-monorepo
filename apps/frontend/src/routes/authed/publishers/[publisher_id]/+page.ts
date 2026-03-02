export const load = async ({ params, parent }) => {
  const { trpcClient } = await parent()

  const publisher = await trpcClient!.publishers.getPublisher.query({
    id: params.publisher_id,
  })

  const { items: contentItems } = await trpcClient!.files.findContent.query({
    sub: publisher.sub,
    contractAddress: import.meta.env.VITE_CONTENT_CONTRACT_ADDRESS,
  })

  return { publisher, contentItems }
}
