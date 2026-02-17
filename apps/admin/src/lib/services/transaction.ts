import { forwardTransaction } from '@repo/fe-services'
import { authStore } from '$lib/auth'
import { ethers, initProvider } from '@repo/fe-evm-provider'

export type PopulatedTx = ethers.ContractTransaction

export async function getSignerAndProvider() {
  const provider = await initProvider(authStore.state.accessToken!)
  const ethersProvider = new ethers.BrowserProvider(provider)
  const signer = await ethersProvider.getSigner()
  return { provider, ethersProvider, signer }
}

export async function sendTx(populatedTx: PopulatedTx) {
  const { ethersProvider } = await getSignerAndProvider()
  const txHash = await forwardTransaction(populatedTx, {
    token: authStore.state.accessToken!,
    client_id: import.meta.env.VITE_CLIENT_ID,
    evm_wss: import.meta.env.VITE_CREDENZA_EVM_WSS,
  })
  const receipt = await ethersProvider.waitForTransaction(txHash)
  if (!receipt) throw new Error('Transaction failed')
  return receipt
}
