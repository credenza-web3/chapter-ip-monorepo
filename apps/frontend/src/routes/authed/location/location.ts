import { DEFAULT_IMAGE_URL } from '$lib/content/image'
import { r2Config } from '@repo/fe-services'
import type { LocationContent } from '@repo/content-types/location'

export { DEFAULT_IMAGE_URL }

export const RECENT_LIMIT = 10

type EqualityFilterValue = string | number | boolean | null

export type LocationFilterCondition = { field: string; op: 'eq'; val: EqualityFilterValue }

export type LocationFilterNode = LocationFilterCondition | { and: LocationFilterNode[] }

type LocationFindContentInput = {
  contractAddress: string
  metadata: LocationFilterNode
  sort: string
  order: 'asc' | 'desc' | undefined
  status: string
}

export type LocationItem = {
  id: string
  name: string
  description: string
  imageUrl: string
}

type ContentItem = {
  id: string
  metadata?: LocationContent['metadata']
}

export function getPreviewUrl(contractAddress: string, contentId: string, filename: string): string {
  return `${r2Config.url}${contractAddress}/${contentId}/${filename}`
}

export function buildLocationFindContentInput(contractAddress: string): LocationFindContentInput {
  return {
    contractAddress,
    metadata: { and: [{ field: 'type', op: 'eq', val: 'location' }] },
    sort: 'createdAt',
    order: 'desc',
    status: 'ACTIVE',
  }
}

export function toLocationItems(contentItems: ContentItem[], contractAddress: string): LocationItem[] {
  return contentItems.flatMap((item) => {
    const metadata = item.metadata
    if (metadata?.type !== 'location') return []

    const fileName = metadata.file_name?.trim()

    return [
      {
        id: item.id,
        name: metadata.name ?? '',
        description: metadata.description ?? '',
        imageUrl: fileName ? getPreviewUrl(contractAddress, item.id, fileName) : DEFAULT_IMAGE_URL,
      },
    ]
  })
}

export function getRecentLocations(items: LocationItem[]): LocationItem[] {
  return items.slice(0, RECENT_LIMIT)
}
