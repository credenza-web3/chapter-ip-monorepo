import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Contract } from 'ethers'
import { abi as licenseAbi } from '@credenza3/contracts/artifacts/LicenseNftContract.json'

import { CommonEvmService } from '../evm/evm.service'

import { BlockedLicenseService } from './blocked-license/blocked-license.service'

@Injectable()
export class CommonLicenseService {
  private licenseNftContract!: Contract

  constructor(
    private readonly configService: ConfigService,
    private readonly commonEvmService: CommonEvmService,
    private readonly blockedLicenseService: BlockedLicenseService,
  ) {
    const provider = this.commonEvmService.getProvider()
    const licenceContractAddress = this.configService.get<string>('evm.licenseNftContractAddress')
    if (!licenceContractAddress) {
      throw new Error('Missing EVM_LICENSE_NTF_CONTRACT_ADDRESS')
    }
    this.licenseNftContract = new Contract(licenceContractAddress, licenseAbi, provider)
  }

  public getLicenseNftContract() {
    return this.licenseNftContract
  }

  public async verify(sub: string, subEvmAddress: string, contentTokenId: string, licenseTokenId: string) {
    subEvmAddress = subEvmAddress.toLowerCase()
    const licenseContentTokenId = (await this.licenseNftContract.getTokenLicenseContentNftId(licenseTokenId)) as number
    if (String(licenseContentTokenId) !== contentTokenId) {
      throw new Error('Invalid license content token ID')
    }

    const licenseOwner = (await this.licenseNftContract.ownerOf(licenseTokenId)) as string
    if (licenseOwner.toLowerCase() !== subEvmAddress) {
      throw new Error('You are not the owner of this license')
    }

    const licenseType = Number(await this.licenseNftContract.getTokenLicenseType(licenseTokenId))
    switch (licenseType) {
      case 2: {
        const blockedLicenseModel = this.blockedLicenseService.getModel()
        const blocked = await blockedLicenseModel.findOne({ tokenId: licenseTokenId, subEvmAddress, sub })
        if (blocked) {
          throw new Error('License has been already used')
        }
        await blockedLicenseModel.create({ tokenId: licenseTokenId, subEvmAddress, sub })
        break
      }
      case 1: {
        const expiresAt = (await this.licenseNftContract.getTokenLicenseExpiresAt(licenseTokenId)) as number
        if (expiresAt < Date.now() / 1000) {
          throw new Error('License expired')
        }
        break
      }
      case 0: {
        break
      }
      default: {
        throw new Error(`Unsupported license type (${licenseType})`)
      }
    }
  }
}
