import { ethers, initProvider } from '@repo/fe-evm-provider'
import { abi as content_abi } from '@credenza3/contracts/artifacts/ContentNftContract.json'

const CONTENT_CONTRACT = import.meta.env.VITE_EVM_CONTENT_NFT_CONTRACT_ADDRESS

export const getTokenPrice = async (accessToken: string, tokenId: string) => {
  try {
    const provider = await initProvider(accessToken)
    const ethersProvider = new ethers.BrowserProvider(provider)

    const contentContract = new ethers.Contract(CONTENT_CONTRACT, content_abi, ethersProvider)

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
