import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Contract } from 'ethers'
import { abi as contentAbi } from '@credenza3/contracts/artifacts/ContentNftContract.json'
import { abi as membershipAbi } from '@credenza3/contracts/artifacts/ChapterIpMembershipContract.json'

import { CommonEvmService } from '../evm/evm.service'

@Injectable()
export class CommonContentService {
  private contentNftContract!: Contract
  private membershipContract!: Contract

  constructor(
    private readonly configService: ConfigService,
    private readonly commonEvmService: CommonEvmService,
  ) {
    const provider = this.commonEvmService.getProvider()
    const contentContractAddress = this.configService.get<string>('evm.contentNftContractAddress')
    if (!contentContractAddress) {
      throw new Error('Missing EVM_CONTENT_NFT_CONTRACT_ADDRESS')
    }
    this.contentNftContract = new Contract(contentContractAddress, contentAbi, provider)
    const membershipContractAddress = this.configService.get<string>('evm.membershipContractAddress')
    if (membershipContractAddress) {
      this.membershipContract = new Contract(membershipContractAddress, membershipAbi, provider)
    }
  }

  public getContentNftContract() {
    return this.contentNftContract
  }

  public async getContentNftContractAddress() {
    return (await this.getContentNftContract().getAddress()).toLowerCase()
  }

  public async verifyIsOwner(subEvmAddress: string, contentTokenId: string) {
    const ownerEvmAddress = (await this.contentNftContract.ownerOf(contentTokenId)) as string
    if (ownerEvmAddress.toLowerCase() !== subEvmAddress.toLowerCase()) {
      throw new Error(`${subEvmAddress} is not the owner of ${contentTokenId}`)
    }
  }
  public async getOwner(contentTokenId: string): Promise<string> {
    return (await this.contentNftContract.ownerOf(contentTokenId)) as string
  }
  public async verifyHasSubscription(publisherAddress: string, subEvmAddress: string): Promise<boolean> {
    if (!this.membershipContract) {
      return false
    }
    const res = (await this.membershipContract.confirmMembership(publisherAddress, subEvmAddress)) as boolean
    return res
  }
}
