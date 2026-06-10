import { r2Config } from '@repo/fe-services'

export const RECENT_LIMIT = 10
export const DEFAULT_IMAGE_URL = r2Config.url + r2Config.defaultImage

type UnknownRecord = Record<string, unknown>

export type LikenessItem = {
  id: string
  name: string
  bio: string
  imageUrl: string
}

type ContentItem = {
  id: string
  metadata?: UnknownRecord
  files?: ContentFile[]
}

type ContentFile = {
  filename: string
  label: string
  key: string
  url?: string
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null
}

function getString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

export function toLikenessItems(contentItems: ContentItem[]): LikenessItem[] {
  return contentItems.flatMap((item) => {
    const metadata = item.metadata
    if (!isRecord(metadata) || metadata.type !== 'likeness') return []

    const profile = isRecord(metadata.profile) ? metadata.profile : {}

    return [
      {
        id: item.id,
        name: getString(profile.fullLegalName),
        bio: getString(profile.bio),
        imageUrl: DEFAULT_IMAGE_URL,
      },
    ]
  })
}

export function getRecentLikenesses(items: LikenessItem[]): LikenessItem[] {
  return items.slice(0, RECENT_LIMIT)
}
