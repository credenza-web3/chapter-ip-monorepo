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
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null
}

function getString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

export function getPreviewUrl(contractAddress: string, contentId: string, filename: string): string {
  return `${r2Config.url}${contractAddress}/${contentId}/${filename}`
}

export function toLikenessItems(contentItems: ContentItem[], contractAddress: string): LikenessItem[] {
  return contentItems.flatMap((item) => {
    const metadata = item.metadata
    if (!isRecord(metadata) || metadata.type !== 'likeness') return []

    const profile = isRecord(metadata.profile) ? metadata.profile : {}

    return [
      {
        id: item.id,
        name: getString(profile.fullLegalName),
        bio: getString(profile.bio),
        imageUrl: getPreviewUrl(contractAddress, item.id, 'headshot_1'),
      },
    ]
  })
}

export function getRecentLikenesses(items: LikenessItem[]): LikenessItem[] {
  return items.slice(0, RECENT_LIMIT)
}
