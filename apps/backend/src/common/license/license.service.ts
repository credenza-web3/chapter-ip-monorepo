import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Contract } from 'ethers'
import { abi as license_abi } from '@credenza3/contracts/artifacts/LicenseNftContract.json'

import { CommonEvmService } from '../evm/evm.service'

@Injectable()
export class CommonLicenseService {
  private licenseNftContract!: Contract

  constructor(
    private readonly configService: ConfigService,
    private readonly commonEvmService: CommonEvmService,
  ) {
    const provider = this.commonEvmService.getProvider()
    const licenceContractAddress = this.configService.get<string>('EVM_LICENSE_NTF_CONTRACT_ADDRESS')
    if (!licenceContractAddress) {
      throw new Error('Missing EVM_LICENSE_NTF_CONTRACT_ADDRESS')
    }
    this.licenseNftContract = new Contract(licenceContractAddress, license_abi, provider)
  }

  public getLicenseNftContract() {
    return this.licenseNftContract
  }
}
