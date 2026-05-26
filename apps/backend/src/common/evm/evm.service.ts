import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JsonRpcProvider } from 'ethers'

export type TLazyMintEip712Domain = {
  name: string
  version: string
  chainId: number
  verifyingContract: string
}

export type TSignLazyMintTokenRequest = {
  domain: TLazyMintEip712Domain
  type: Record<string, Array<{ name: string; type: string }>>
  voucher: Record<string, unknown>
}

export type TSignLazyMintTokenResponse = {
  sig: string
  voucher: unknown
}

@Injectable()
export class CommonEvmService {
  private provider!: JsonRpcProvider

  constructor(private readonly configService: ConfigService) {
    const rpcUrl = this.configService.get<string>('evm.rpcUrl')
    if (!rpcUrl) {
      throw new Error('Missing EVM_RPC_URL')
    }
    this.provider = new JsonRpcProvider(rpcUrl)
  }

  public getProvider() {
    return this.provider
  }

  private getCredenzaEvmAuthHeaders(): Record<string, string> {
    const clientId = this.configService.get<string>('credenza.clientId')
    const clientSecret = this.configService.get<string>('credenza.clientSecret')
    return {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/json',
    }
  }

  public async getUserEvmAddressBySub(sub: string) {
    const evmUrl = this.configService.get<string>('credenza.evmUrl')
    if (!evmUrl) {
      throw new Error('Missing EVM_URL')
    }
    const result = await fetch(`${evmUrl}/accounts/${sub}/address`, {
      headers: this.getCredenzaEvmAuthHeaders(),
    })
    const json = (await result.json()) as { address: string }
    return json.address
  }

  public async signLazyMintToken(body: TSignLazyMintTokenRequest): Promise<TSignLazyMintTokenResponse> {
    const evmUrl = this.configService.get<string>('credenza.evmUrl')
    if (!evmUrl) {
      throw new Error('Missing EVM_URL')
    }
    const result = await fetch(`${evmUrl}/contracts/lazy-mint/sign`, {
      method: 'POST',
      headers: this.getCredenzaEvmAuthHeaders(),
      body: JSON.stringify(body),
    })
    if (!result.ok) {
      const errorBody = await result.text()
      throw new Error(`Credenza EVM lazy-mint sign failed (${result.status}): ${errorBody}`)
    }
    return (await result.json()) as TSignLazyMintTokenResponse
  }
}
