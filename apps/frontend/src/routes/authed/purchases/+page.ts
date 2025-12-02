import { getTokensWithMetadata } from './helper'

export const load = async ({ params, parent }) => {
  const { accessToken } = await parent()
  const tokens = await getTokensWithMetadata(accessToken)

  return {
    purchases: tokens,
  }
}
