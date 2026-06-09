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
    const uploadsByBucket = isRecord(metadata.uploadsByBucket) ? metadata.uploadsByBucket : {}
    const headshots = Array.isArray(uploadsByBucket.headshots) ? uploadsByBucket.headshots : []
    const headshotFilename = headshots.find((filename): filename is string => typeof filename === 'string') ?? null
    const imageUrl = getContentFileUrl(item.files, headshotFilename)

    return [
      {
        id: item.id,
        name: getString(profile.fullLegalName),
        bio: getString(profile.bio),
        imageUrl,
      },
    ]
  })
}

export function getRecentLikenesses(items: LikenessItem[]): LikenessItem[] {
  return items.slice(0, RECENT_LIMIT)
}

function getContentFileUrl(files: ContentFile[] | undefined, headshotFilename: string | null): string {
  const file = files?.find(
    (candidate) =>
      candidate.key &&
      (!headshotFilename || candidate.filename === headshotFilename || candidate.label === headshotFilename),
  )

  return file ? r2Config.url + file.key : DEFAULT_IMAGE_URL
}
