import { authStore } from '$lib'
import { ethers, initProvider, getSigner } from '@repo/fe-evm-provider'
import { abi as content_abi } from '@credenza3/contracts/artifacts/ContentNftContract.json'
import { forwardTransaction } from '@repo/fe-services'

export const uploadFileToBucket = async (uploaded: File, url: string) => {
  const uploadFileRes = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': uploaded.type,
    },
    body: uploaded,
  })

  if (!uploadFileRes.ok) {
    throw new Error(`Upload failed: ${uploadFileRes.status} ${uploadFileRes.statusText}`)
  }
}
export const mintWithPrices = async (accessToken: string): Promise<string> => {
  const provider = await initProvider(accessToken)
  const ethersProvider = new ethers.BrowserProvider(provider)
  const signer = await getSigner()
  const contentContract = new ethers.Contract(
    import.meta.env.VITE_EVM_CONTENT_NFT_CONTRACT_ADDRESS,
    content_abi,
    signer,
  )
  const userAddress = await signer.getAddress()

  const mintPopulatedTx = await contentContract.mintWithPrices.populateTransaction(
    userAddress,
    '',
    '',
    1000,
    10,
    0,
    0,
    0,
    0,
    100,
    1,
    0,
  )

  const txHash = await forwardTransaction(mintPopulatedTx, {
    token: authStore.state.accessToken!,
    client_id: import.meta.env.VITE_CLIENT_ID,
    evm_wss: import.meta.env.VITE_CREDENZA_EVM_WSS,
  })

  const receipt = await ethersProvider.waitForTransaction(txHash)
  if (!receipt) throw new Error('Transaction failed')
  const transferEvent = receipt.logs
    .map((log) => {
      try {
        return contentContract.interface.parseLog(log)
      } catch {
        return null
      }
    })
    .find((event) => event?.name === 'Transfer')

  const tokenId = Number(transferEvent?.args.tokenId)
  return String(tokenId)
}
