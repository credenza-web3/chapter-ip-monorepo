import { forwardTransaction } from '@repo/fe-services'
import { authStore } from '$lib'
import { ethers } from '@repo/fe-evm-provider'
import { abi as content_abi } from '@credenza3/contracts/artifacts/ContentNftContract.json'
import { BlockchainService } from './blockchain.service'

export class TransactionService {
  private blockchainService = new BlockchainService()

  async mintWithPrices(accessToken: string, lifetimePrice: number, onetimePrice: number): Promise<string> {
    const userAddress = await this.blockchainService.getUserAddress()
    const mintPopulatedTx = await this.blockchainService.createMintTransaction(userAddress, lifetimePrice, onetimePrice)

    const txHash = await this.forwardMintTransaction(mintPopulatedTx)
    const tokenId = await this.extractTokenIdFromTransaction(txHash, accessToken)

    return String(tokenId)
  }

  private async forwardMintTransaction(mintPopulatedTx: any): Promise<string> {
    return await forwardTransaction(mintPopulatedTx, {
      token: authStore.state.accessToken!,
      client_id: import.meta.env.VITE_CLIENT_ID,
      evm_wss: import.meta.env.VITE_CREDENZA_EVM_WSS,
    })
  }

  private async extractTokenIdFromTransaction(txHash: string, accessToken: string): Promise<number> {
    const ethersProvider = await this.blockchainService.getEthersProvider(accessToken)
    const receipt = await ethersProvider.waitForTransaction(txHash)

    if (!receipt) {
      throw new Error('Transaction failed')
    }
    const signer = await (await import('@repo/fe-evm-provider')).getSigner()
    const contentContract = new ethers.Contract(
      import.meta.env.VITE_EVM_CONTENT_NFT_CONTRACT_ADDRESS,
      content_abi,
      signer,
    )

    const transferEvent = this.blockchainService.parseTransferEvent(receipt, contentContract)
    const tokenId = Number(transferEvent?.args.tokenId)

    if (!tokenId) {
      throw new Error('Could not extract token ID from transaction')
    }

    return tokenId
  }
}
