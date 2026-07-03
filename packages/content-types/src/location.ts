import type { YesNo } from './likeness'

export type LocationLicensingMetadata = {
  licenseTypes: Record<string, boolean>
  licensePrices: Record<string, string>
  permittedUses: Record<string, boolean>
  territories: string[]
  allowRetouching: YesNo
  approveFinalUse: YesNo
  agreedToFee: boolean
}

export type LocationMetadata = {
  type: 'location'
  name: string
  description: string
  tags: string[]
  file_name: string
  licensing: LocationLicensingMetadata
}

export type LocationLicensingMetadataInput = Partial<LocationLicensingMetadata>

export type LocationMetadataInput = Partial<Omit<LocationMetadata, 'type' | 'licensing'>> & {
  type?: string
  licensing?: LocationLicensingMetadataInput
}

export type LocationContent = {
  id: string
  tokenId?: string
  metadata?: LocationMetadataInput
  sub: string
  status: string
  contractAddress: string
}
