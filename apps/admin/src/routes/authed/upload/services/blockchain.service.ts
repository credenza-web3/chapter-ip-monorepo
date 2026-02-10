import { ethers, initProvider, getSigner } from '@repo/fe-evm-provider'
import { abi as content_abi } from '@credenza3/contracts/artifacts/ContentNftContract.json'

export class BlockchainService {
  private getContentContract(signer: any) {
    return new ethers.Contract(
      import.meta.env.VITE_EVM_CONTENT_NFT_CONTRACT_ADDRESS,
      content_abi,
      signer,
    )
  }

  async createMintTransaction(
    userAddress: string,
    lifetimePrice: number,
    onetimePrice: number,
  ) {
    const signer = await getSigner()
    const contentContract = this.getContentContract(signer)

    return await contentContract.mintWithPrices.populateTransaction(
      userAddress,
      '',
      '',
      lifetimePrice * 100,
      lifetimePrice * 10 ** 6, // cred decimals (6 decimals)
      0,
      0,
      0,
      0,
      onetimePrice * 100,
      onetimePrice * 10 ** 6, // cred decimals
      0,
    )
  }

  async getEthersProvider(accessToken: string) {
    const provider = await initProvider(accessToken)
    return new ethers.BrowserProvider(provider)
  }

  parseTransferEvent(receipt: any, contentContract: any) {
    return receipt.logs
      .map((log: any) => {
        try {
          return contentContract.interface.parseLog(log)
        } catch {
          return null
        }
      })
      .find((event: any) => event?.name === 'Transfer')
  }

  async getUserAddress() {
    const signer = await getSigner()
    return await signer.getAddress()
  }
}
