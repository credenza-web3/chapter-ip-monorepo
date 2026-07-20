export const load = async ({ parent }) => {
  const { trpcClient } = await parent()
  if (!trpcClient) throw new Error('tRPC client is not initialized')
  const result = await trpcClient.publishers.findPublishers.query({})
  return {
    publishers: result.items.map(({ id, title, avatarUrl }) => ({ id, title, avatarUrl })),
  }
}
