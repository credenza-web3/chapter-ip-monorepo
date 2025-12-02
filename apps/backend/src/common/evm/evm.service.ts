import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JsonRpcProvider } from 'ethers'

@Injectable()
export class CommonEvmService {
  private provider!: JsonRpcProvider

  constructor(private readonly configService: ConfigService) {
    const rpcUrl = this.configService.get<string>('EVM_RPC_URL')
    if (!rpcUrl) {
      throw new Error('Missing EVM_RPC_URL')
    }
    this.provider = new JsonRpcProvider(rpcUrl)
  }

  public getProvider() {
    return this.provider
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
