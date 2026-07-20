import { forwardTransaction } from '@repo/fe-services'
import { authStore } from '$lib'
import { ethers } from '@repo/fe-evm-provider'
import BlockchainService from './blockchain.service'
import { configStore, ContractName } from '$lib/stores/config.svelte'

export default class TransactionService {
  constructor(private readonly blockchainService: BlockchainService) {}

  async mintWithPrices(accessToken: string, prices: { oneTimePrice: number; lifetimePrice?: number }): Promise<string> {
    const userAddress = await this.blockchainService.getUserAddress()
    const mintPopulatedTx = await this.blockchainService.createMintTransaction(userAddress, prices)

    const txHash = await this.forwardMintTransaction(mintPopulatedTx)
    const tokenId = await this.extractTokenIdFromTransaction(txHash, accessToken)

    return String(tokenId)
  }

  private async forwardMintTransaction(mintPopulatedTx: ethers.ContractTransaction): Promise<string> {
    return await forwardTransaction(mintPopulatedTx, {
      token: authStore.state.accessToken!,
      client_id: import.meta.env.VITE_CLIENT_ID,
      evm_wss: import.meta.env.VITE_CREDENZA_EVM_WSS,
    })
  }

  private async extractTokenIdFromTransaction(txHash: string, accessToken: string): Promise<number> {
    const ethersProvider = await this.blockchainService.getEthersProvider(accessToken)
    const receipt = await ethersProvider.waitForTransaction(txHash)

    await new Promise((resolve) => setTimeout(resolve, 2000))

    if (!receipt) {
      throw new Error('Transaction failed')
    }
    const signer = await (await import('@repo/fe-evm-provider')).getSigner()
    const contentContract = configStore.getContract(ContractName.CONTENT_NFT, signer)

    const transferEvent = this.blockchainService.parseTransferEvent(receipt, contentContract)
    const tokenId = Number(transferEvent?.args.tokenId)

    if (!tokenId) {
      throw new Error('Could not extract token ID from transaction')
    }

    return tokenId
  }
}
