import { getTokensWithMetadata } from './helper'

export const load = async ({ parent }) => {
  const { accessToken, trpcClient } = await parent()

  const tokens = await getTokensWithMetadata(accessToken!, trpcClient!)

  return {
    purchases: tokens,
  }
}
