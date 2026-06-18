export type YesNo = 'yes' | 'no' | null

export type LikenessProfileAttributes = {
  ethnicity: string
  heightFt: string
  heightIn: string
  weight: string
  eyeColor: string
  hairColor: string
}

export type LikenessProfileAffiliation = {
  union: string
  memberId: string
}

export type LikenessProfileMetadata = {
  fullLegalName: string
  stageName: string
  bio: string
  attributes: LikenessProfileAttributes
  affiliations: LikenessProfileAffiliation[]
}

export type LikenessLicensingMetadata = {
  isLifetime: boolean
  isOneTime: boolean
  lifetimePrice: number
  oneTimePrice: number
  licenseTypes: Record<string, boolean>
  licensePrices: Record<string, string>
  licenseDropdowns: Record<string, string>
  permittedUses: Record<string, boolean>
  territories: string[]
  allowRetouching: YesNo
  approveFinalUse: YesNo
  agreedToFee: boolean
}

export type LikenessMetadata = {
  type: 'likeness'
  profile: LikenessProfileMetadata
  licensing: LikenessLicensingMetadata
  uploadsByBucket?: Record<string, string[]>
}

export type LikenessProfileMetadataInput = Partial<Omit<LikenessProfileMetadata, 'attributes' | 'affiliations'>> & {
  attributes?: Partial<LikenessProfileAttributes>
  affiliations?: Array<Partial<LikenessProfileAffiliation>>
}

export type LikenessLicensingMetadataInput = Partial<LikenessLicensingMetadata>

export type LikenessMetadataInput = {
  type?: string
  profile?: LikenessProfileMetadataInput
  licensing?: LikenessLicensingMetadataInput
  uploadsByBucket?: Record<string, string[]>
}

export type ContentFile = {
  id: string
  filename: string
  label: string
  mimetype: string
}

export type LikenessContent = {
  id: string
  tokenId?: string
  metadata?: LikenessMetadataInput
  files?: ContentFile[]
}

export type LikenessAffiliation = {
  union: string
  memberId: string
}

export type LikenessAttribute = {
  label: string
  value: string
}

export type LikenessLicense = {
  id: string
  name: string
  price: string
  detail: string
  description: string
}

export type LikenessImage = {
  src: string
  alt: string
}

export type LikenessMedia =
  | (LikenessImage & {
      id: string
      type: 'image'
    })
  | {
      id: string
      type: 'audio' | 'video' | 'file'
      label: string
    }

export type LikenessDetails = {
  id: string
  contentTokenId?: string
  name: string
  stageName: string
  bio: string
  attributes: LikenessAttribute[]
  affiliations: LikenessAffiliation[]
  licenses: LikenessLicense[]
  permittedUses: string[]
  territories: string[]
  allowRetouching: boolean
  approveFinalUse: boolean
  images: LikenessImage[]
  media: LikenessMedia[]
}

export type LikenessPurchase = LikenessDetails
