export const load = async ({ parent }) => {
  const { trpcClient } = await parent()

  const { items } = await trpcClient!.publishers.findPublishers.query({
    limit: '100',
  })
  return { publishers: items }
}
