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

export type LikenessPurchase = {
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
