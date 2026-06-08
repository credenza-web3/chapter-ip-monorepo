import { ethers, initProvider } from '@repo/fe-evm-provider'
import { configStore, ContractName } from '$lib/stores/config.svelte'

export const getTokenPrice = async (accessToken: string, tokenId: string) => {
  try {
    const provider = await initProvider(accessToken)
    const ethersProvider = new ethers.BrowserProvider(provider)

    const contentContract = configStore.getContract(ContractName.CONTENT_NFT, ethersProvider)

    const priceCentsFulltimeLicense = await contentContract.getLicensePriceFiat(tokenId, '0')
    const priceCentsOnetimeLicense = await contentContract.getLicensePriceFiat(tokenId, '2')
    return {
      fulltime: Number(priceCentsFulltimeLicense) / 100,
      onetime: Number(priceCentsOnetimeLicense) / 100,
    }
  } catch (error) {
    console.error('Error fetching token price:', error)
    return { fulltime: 0, onetime: 0 }
  }
}
