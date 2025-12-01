import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JsonRpcProvider, Contract } from 'ethers'
import { abi as license_abi } from '@credenza3/contracts/artifacts/LicenseNftContract.json'
import { abi as content_abi } from '@credenza3/contracts/artifacts/ContentNftContract.json'

@Injectable()
export class CommonEvmService {
  private provider!: JsonRpcProvider
  private licenseNftContract!: Contract
  private contentNftContract!: Contract

  constructor(private readonly configService: ConfigService) {
    const rpcUrl = this.configService.get<string>('EVM_RPC_URL')
    if (!rpcUrl) {
      throw new Error('Missing EVM_RPC_URL')
    }
    const contentContractAddress = this.configService.get<string>('EVM_CONTENT_NFT_CONTRACT_ADDRESS')
    if (!contentContractAddress) {
      throw new Error('Missing EVM_CONTENT_NFT_CONTRACT_ADDRESS')
    }
    const licenceContractAddress = this.configService.get<string>('EVM_LICENSE_NTF_CONTRACT_ADDRESS')
    if (!licenceContractAddress) {
      throw new Error('Missing EVM_LICENSE_NTF_CONTRACT_ADDRESS')
    }
    this.provider = new JsonRpcProvider(rpcUrl)
    this.contentNftContract = new Contract(contentContractAddress, content_abi, this.provider)
    this.licenseNftContract = new Contract(licenceContractAddress, license_abi, this.provider)
  }

  public getProvider() {
    return this.provider
  }

  public getContentNftContract() {
    return this.contentNftContract
  }

  public getLicenseNftContract() {
    return this.licenseNftContract
  }

  public async getUserEvmAddressBySub(sub: string) {
    const evmUrl = this.configService.get<string>('EVM_URL')
    if (!evmUrl) {
      throw new Error('Missing EVM_URL')
    }
    const clientId = this.configService.get<string>('CLIENT_ID')
    const clientSecret = this.configService.get<string>('CLIENT_SECRET')
    const result = await fetch(`${evmUrl}/accounts/${sub}/address`, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
    })
    const json = (await result.json()) as { address: string }
    return json.address
  }
}
