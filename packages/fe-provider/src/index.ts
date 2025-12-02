import { CredenzaProvider, ethers } from '@credenza3/evm-provider'

let provider: CredenzaProvider
let signer: ethers.Signer

export const initProvider = async (accessToken: string): Promise<CredenzaProvider> => {
  if (provider) return provider

  provider = new CredenzaProvider({
    rpcUrl: 'https://avalanche-fuji-c-chain-rpc.publicnode.com',
    accessToken,
    env: 'staging', // 'prod' | 'staging'
  })

  return provider
}

export const getSigner = async (): Promise<ethers.Signer> => {
  if (signer) return signer

  if (!provider) {
    throw new Error('Provider not initialized. Call initProvider first')
  }

  const ethersProvider = new ethers.BrowserProvider(provider)
  signer = await ethersProvider.getSigner()
  return signer
}

export { ethers }
