import { getTokensWithMetadata } from './helper'

export const load = async ({ parent }) => {
  const { accessToken, trpcClient } = await parent()

  const tokens = await getTokensWithMetadata(accessToken!, trpcClient!)

  const lifetimeLicenses = tokens.filter((p) => p.licenseType === '0')
  const onetimeLicenses = tokens.filter((p) => p.licenseType === '2')
  return {
    lifetimeLicenses,
    onetimeLicenses,
  }
}
