import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Contract } from 'ethers'
import { abi as contentAbi } from '@credenza3/contracts/artifacts/ContentNftContract.json'

import { CommonEvmService } from '../evm/evm.service'

@Injectable()
export class CommonContentService {
  private contentNftContract!: Contract

  constructor(
    private readonly configService: ConfigService,
    private readonly commonEvmService: CommonEvmService,
  ) {
    const provider = this.commonEvmService.getProvider()
    const contentContractAddress = this.configService.get<string>('EVM_CONTENT_NFT_CONTRACT_ADDRESS')
    if (!contentContractAddress) {
      throw new Error('Missing EVM_CONTENT_NFT_CONTRACT_ADDRESS')
    }
    this.contentNftContract = new Contract(contentContractAddress, contentAbi, provider)
  }

  public getContentNftContract() {
    return this.contentNftContract
  }
}
