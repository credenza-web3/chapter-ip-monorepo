export type ConfigResponse = {
  contractAddresses: {
    contentNft: string
    licenseNft: string
    membership: string
  }
  chainId: number
  env: string
}