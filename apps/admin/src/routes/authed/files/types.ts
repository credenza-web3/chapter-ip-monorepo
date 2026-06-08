export type TMetadata = {
  type: string
  licensing: Record<string, unknown>
  profile: Record<string, unknown>
  uploadsByBucket: Record<string, string[]>
}

export type TContentStatistic = {
  tokenId: string
  boughtLicensesAmount: number
  revenue: {
    fiat: string
    eth: string
    token: string
  }
}
