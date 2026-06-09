import { r2Config } from '@repo/fe-services'
import type { AppRouter, TRPCClient } from '@repo/trpc/client'

export const RECENT_LIMIT = 10
export const DEFAULT_IMAGE_URL = r2Config.url + r2Config.defaultImage

type UnknownRecord = Record<string, unknown>

export type LikenessItem = {
  id: string
  name: string
  bio: string
  headshotFilename: string | null
}

type ContentItem = {
  id: string
  metadata?: UnknownRecord
}

type ContentFile = {
  filename: string
  label: string
  key: string
}

let imageRequestsByClient = new WeakMap<object, Map<string, Promise<string>>>()

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

    return [
      {
        id: item.id,
        name: getString(profile.fullLegalName),
        bio: getString(profile.bio),
        headshotFilename,
      },
    ]
  })
}

export function getRecentLikenesses(items: LikenessItem[]): LikenessItem[] {
  return items.slice(0, RECENT_LIMIT)
}

async function resolveImageUrl(
  trpcClient: TRPCClient<AppRouter>,
  contentId: string,
  headshotFilename: string,
): Promise<string> {
  const content = await trpcClient.contents.getContentById.query({ id: contentId })
  const file = (content.files as ContentFile[]).find(
    (candidate) => candidate.filename === headshotFilename || candidate.label === headshotFilename,
  )
  // const { url } = await trpcClient.contents.getContentFileLink.query({ id: file.id })
  return DEFAULT_IMAGE_URL
}

export function getLikenessImageUrl(
  trpcClient: TRPCClient<AppRouter>,
  contentId: string,
  headshotFilename: string | null,
): Promise<string> {
  if (!headshotFilename) return Promise.resolve(DEFAULT_IMAGE_URL)

  let imageRequests = imageRequestsByClient.get(trpcClient)
  if (!imageRequests) {
    imageRequests = new Map()
    imageRequestsByClient.set(trpcClient, imageRequests)
  }

  const cacheKey = `${contentId}:${headshotFilename}`
  const cachedRequest = imageRequests.get(cacheKey)
  if (cachedRequest) return cachedRequest

  const request = resolveImageUrl(trpcClient, contentId, headshotFilename).catch(() => {
    imageRequests.delete(cacheKey)
    return DEFAULT_IMAGE_URL
  })

  imageRequests.set(cacheKey, request)
  return request
}

export function clearLikenessImageCache() {
  imageRequestsByClient = new WeakMap()
}
