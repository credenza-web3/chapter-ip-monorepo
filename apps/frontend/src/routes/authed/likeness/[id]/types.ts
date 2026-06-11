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

export type LikenessPurchase = {
  id: string
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
  images: { src: string; alt: string }[]
}
