import { DEFAULT_IMAGE_URL } from '$lib/content/image'
import { r2BaseConfig } from '@repo/fe-services'
import type { LocationContent } from '@repo/content-types/location'

export { DEFAULT_IMAGE_URL }

export const RECENT_LIMIT = 10

type EqualityFilterValue = string | number | boolean | null

export type LocationFilterCondition =
  | { field: string; op: 'eq'; val: EqualityFilterValue }
  | { field: string; op: 'regex'; val: string }

export type LocationFilterNode = LocationFilterCondition | { and: LocationFilterNode[] } | { or: LocationFilterNode[] }

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
  imageUrls: string[]
  authorName?: string
  metadata?: LocationContent['metadata']
}

export type LocationFilters = {
  query: string
}

type ContentItem = {
  id: string
  metadata?: LocationContent['metadata']
}

const SEARCH_FIELDS = ['name', 'description'] as const
const REGEX_SPECIAL_CHARS = /[\\^$.*+?()[\]{}|]/g

export function getPreviewUrl(contractAddress: string, contentId: string, filename: string): string {
  return `${r2BaseConfig.previewUrl}/${contractAddress}/${contentId}/${filename}`
}

export function createEmptyLocationFilters(): LocationFilters {
  return { query: '' }
}

export function parseLocationFilters(searchParams: URLSearchParams): LocationFilters {
  return {
    query: searchParams.get('q')?.trim() ?? '',
  }
}

function equalCondition(field: string, val: EqualityFilterValue): LocationFilterCondition {
  return { field, op: 'eq', val }
}

function escapeRegex(value: string): string {
  return value.replace(REGEX_SPECIAL_CHARS, '\\$&')
}

function toCaseInsensitiveRegexPattern(value: string): string {
  return Array.from(value)
    .map((char) => {
      const lower = char.toLowerCase()
      const upper = char.toUpperCase()

      if (lower !== upper && /^[a-z]$/i.test(char)) return `[${escapeRegex(lower)}${escapeRegex(upper)}]`

      return escapeRegex(char)
    })
    .join('')
}

function appendSearchFilter(nodes: LocationFilterNode[], query: string) {
  const trimmedQuery = query.trim()
  if (!trimmedQuery) return

  nodes.push({
    or: SEARCH_FIELDS.map((field) => ({ field, op: 'regex', val: toCaseInsensitiveRegexPattern(trimmedQuery) })),
  })
}

export function buildLocationFilterInput(filters: LocationFilters): LocationFilterNode {
  const and: LocationFilterNode[] = [equalCondition('type', 'location')]

  appendSearchFilter(and, filters.query)

  return { and }
}

export function buildLocationFindContentInput(
  contractAddress: string,
  filters: LocationFilters = createEmptyLocationFilters(),
): LocationFindContentInput {
  return {
    contractAddress,
    metadata: buildLocationFilterInput(filters),
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
    const fileNames = metadata.file_names?.length ? metadata.file_names : fileName ? [fileName] : []

    const imageUrls = fileNames.map((name) => getPreviewUrl(contractAddress, item.id, name))

    return [
      {
        id: item.id,
        name: metadata.name ?? '',
        description: metadata.description ?? '',
        imageUrl: imageUrls[0] ?? DEFAULT_IMAGE_URL,
        imageUrls,
        metadata,
      },
    ]
  })
}

export function getRecentLocations(items: LocationItem[]): LocationItem[] {
  return items.slice(0, RECENT_LIMIT)
}
