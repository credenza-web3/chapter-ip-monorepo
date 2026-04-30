import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { CommonClientService } from '../common/client/client.service'

import type { TExchangeCodeInput, TRefreshTokenInput, TAuthTokenOutput } from './auth.dto'

@Injectable()
export class AuthService {
  constructor(
    private readonly commonClientService: CommonClientService,
    private readonly configService: ConfigService,
  ) {}

  async refreshToken(payload: TRefreshTokenInput): Promise<TAuthTokenOutput> {
    const { clientId, clientSecret } = this.commonClientService.getClientIdAndSecret()
    const urlEncoded = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: payload.refreshToken,
    })

    const accountsUrl = this.configService.get<string>('credenza.accountsUrl')

    const response = await fetch(`${accountsUrl}/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: urlEncoded.toString(),
    })
    if (!response.ok) {
      throw new Error(`Cannot refresh token`)
    }
    const json = (await response.json()) as {
      access_token: string
      refresh_token?: string
      id_token?: string
    }

    return {
      accessToken: json.access_token,
      ...(json.refresh_token && { refreshToken: json.refresh_token }),
      ...(json.id_token && { idToken: json.id_token }),
    }
  }

  async exchangeCode(payload: TExchangeCodeInput): Promise<TAuthTokenOutput> {
    const { clientId, clientSecret } = this.commonClientService.getClientIdAndSecret()
    const urlEncoded = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      code: payload.code,
      code_verifier: payload.codeVerifier,
      redirect_uri: payload.redirectUri,
    })

    const accountsUrl = this.configService.get<string>('credenza.accountsUrl')

    const response = await fetch(`${accountsUrl}/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: urlEncoded.toString(),
    })

    if (!response.ok) {
      throw new Error('Cannot exchange code for token')
    }
    const json = (await response.json()) as {
      access_token: string
      refresh_token?: string
      id_token?: string
    }

    return {
      accessToken: json.access_token,
      ...(json.refresh_token && { refreshToken: json.refresh_token }),
      ...(json.id_token && { idToken: json.id_token }),
    }
  }
}
