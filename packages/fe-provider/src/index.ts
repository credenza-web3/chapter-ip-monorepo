import { CredenzaProvider, ethers } from '@credenza3/evm-provider'

let provider: CredenzaProvider
let signer: ethers.Signer

export const initProvider = async (accessToken: string): Promise<CredenzaProvider> => {
  if (provider) return provider

  const credenzaEnv = import.meta.env.VITE_ENV || 'staging'
  console.log('credenzaEnv', credenzaEnv)
  const providerConfig =
    credenzaEnv === 'prod'
      ? {
          rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
          accessToken,
          env: 'prod', // 'prod' | 'staging'
        }
      : {
          rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
          accessToken,
          env: 'staging', // 'prod' | 'staging'
        }

  provider = new CredenzaProvider(providerConfig)

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
