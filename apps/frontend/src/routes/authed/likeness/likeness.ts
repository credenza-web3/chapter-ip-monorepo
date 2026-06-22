import { r2Config } from '@repo/fe-services'
import {
  ETHNICITY_OPTIONS,
  EYE_COLOR_OPTIONS,
  HAIR_COLOR_OPTIONS,
  HEIGHT_RANGES,
  LICENSE_TYPE_OPTIONS,
  PERMITTED_USE_OPTIONS,
  UNION_OPTIONS,
  WEIGHT_RANGES,
  type LikenessContent,
  type LikenessOption,
  type LikenessOptionValue,
  type LikenessProfileAffiliation,
  type LikenessRange,
} from '@repo/content-types/likeness'

export {
  ETHNICITY_OPTIONS,
  EYE_COLOR_OPTIONS,
  HAIR_COLOR_OPTIONS,
  HEIGHT_RANGES,
  LICENSE_TYPE_OPTIONS,
  PERMITTED_USE_OPTIONS,
  UNION_OPTIONS,
  WEIGHT_RANGES,
}

export const RECENT_LIMIT = 10
export const DEFAULT_IMAGE_URL = r2Config.url + r2Config.defaultImage

type ArrayFilterKey = 'ethnicity' | 'eyeColor' | 'hairColor' | 'union' | 'licenseType' | 'permittedUse'

export type LikenessItem = {
  id: string
  name: string
  bio: string
  imageUrl: string
  filterData?: {
    ethnicity: string
    heightInches: number | null
    weightLbs: number | null
    eyeColor: string
    hairColor: string
    unions: string[]
    licenseTypes: string[]
    permittedUses: string[]
  }
}

type ContentItem = {
  id: string
  metadata?: LikenessContent['metadata']
}

export type LikenessFilters = {
  query: string
  ethnicity: LikenessOptionValue<typeof ETHNICITY_OPTIONS>[]
  eyeColor: LikenessOptionValue<typeof EYE_COLOR_OPTIONS>[]
  hairColor: LikenessOptionValue<typeof HAIR_COLOR_OPTIONS>[]
  union: LikenessOptionValue<typeof UNION_OPTIONS>[]
  licenseType: LikenessOptionValue<typeof LICENSE_TYPE_OPTIONS>[]
  permittedUse: LikenessOptionValue<typeof PERMITTED_USE_OPTIONS>[]
  height: LikenessOptionValue<typeof HEIGHT_RANGES> | null
  weight: LikenessOptionValue<typeof WEIGHT_RANGES> | null
}

function normalizeToken(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function getOptionLabels(options: readonly LikenessOption[]): Record<string, string> {
  return Object.fromEntries(options.map((option) => [option.value, option.label]))
}

const ETHNICITY_LABELS = getOptionLabels(ETHNICITY_OPTIONS)
const EYE_COLOR_LABELS = getOptionLabels(EYE_COLOR_OPTIONS)
const HAIR_COLOR_LABELS = getOptionLabels(HAIR_COLOR_OPTIONS)
const UNION_LABELS = getOptionLabels(UNION_OPTIONS)
const LICENSE_TYPE_LABELS = getOptionLabels(LICENSE_TYPE_OPTIONS)
const PERMITTED_USE_LABELS = getOptionLabels(PERMITTED_USE_OPTIONS)

function selectedOptionValues<TOptions extends readonly LikenessOption[]>(
  searchParams: URLSearchParams,
  key: ArrayFilterKey,
  options: TOptions,
): LikenessOptionValue<TOptions>[] {
  const allowed = new Set(options.map((option) => option.value))
  return Array.from(
    new Set(searchParams.getAll(key).filter((value) => allowed.has(value))),
  ) as LikenessOptionValue<TOptions>[]
}

function selectedOptionValue<TOptions extends readonly LikenessOption[]>(
  searchParams: URLSearchParams,
  key: string,
  options: TOptions,
): LikenessOptionValue<TOptions> | null {
  const allowed = new Set(options.map((option) => option.value))
  const selected = searchParams.getAll(key).find((value) => allowed.has(value))

  return (selected ?? null) as LikenessOptionValue<TOptions> | null
}

function hasMatchingValue(candidate: string, selected: string[], labels: Record<string, string>): boolean {
  if (selected.length === 0) return true
  if (!candidate) return false

  const normalizedCandidate = normalizeToken(candidate)

  return selected.some((value) => {
    const label = labels[value] ?? value
    return normalizedCandidate === normalizeToken(value) || normalizedCandidate === normalizeToken(label)
  })
}

function hasMatchingList(candidates: string[], selected: string[], labels: Record<string, string>): boolean {
  if (selected.length === 0) return true
  return candidates.some((candidate) => hasMatchingValue(candidate, selected, labels))
}

function matchesSearchQuery(item: Pick<LikenessItem, 'name' | 'bio'>, query: string): boolean {
  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery) return true

  return item.name.toLowerCase().includes(normalizedQuery) || item.bio.toLowerCase().includes(normalizedQuery)
}

function getEnabledKeys(value: Record<string, boolean> | undefined): string[] {
  if (!value) return []

  return Object.entries(value).flatMap(([key, enabled]) => (enabled === true ? [key] : []))
}

function getAffiliationUnions(value: Array<Partial<LikenessProfileAffiliation>> | undefined): string[] {
  return (
    value?.flatMap((affiliation) => {
      const union = affiliation.union?.trim()
      return union ? [union] : []
    }) ?? []
  )
}

function matchesRange(value: number | null, selectedRange: string | null, ranges: readonly LikenessRange[]): boolean {
  if (!selectedRange) return true
  const range = ranges.find((item) => item.value === selectedRange)
  if (!range) return true
  if (!value) return false
  if (range.min && value < range.min) return false
  if (range.max && value >= range.max) return false

  return true
}

function getFallbackFilterData(): NonNullable<LikenessItem['filterData']> {
  return {
    ethnicity: '',
    heightInches: null,
    weightLbs: null,
    eyeColor: '',
    hairColor: '',
    unions: [],
    licenseTypes: [],
    permittedUses: [],
  }
}

export function getPreviewUrl(contractAddress: string, contentId: string, filename: string): string {
  return `${r2Config.url}${contractAddress}/${contentId}/${filename}`
}

export function createEmptyLikenessFilters(): LikenessFilters {
  return {
    query: '',
    ethnicity: [],
    eyeColor: [],
    hairColor: [],
    union: [],
    licenseType: [],
    permittedUse: [],
    height: null,
    weight: null,
  }
}

export function parseLikenessFilters(searchParams: URLSearchParams): LikenessFilters {
  return {
    query: searchParams.get('q')?.trim() ?? '',
    ethnicity: selectedOptionValues(searchParams, 'ethnicity', ETHNICITY_OPTIONS),
    eyeColor: selectedOptionValues(searchParams, 'eyeColor', EYE_COLOR_OPTIONS),
    hairColor: selectedOptionValues(searchParams, 'hairColor', HAIR_COLOR_OPTIONS),
    union: selectedOptionValues(searchParams, 'union', UNION_OPTIONS),
    licenseType: selectedOptionValues(searchParams, 'licenseType', LICENSE_TYPE_OPTIONS),
    permittedUse: selectedOptionValues(searchParams, 'permittedUse', PERMITTED_USE_OPTIONS),
    height: selectedOptionValue(searchParams, 'height', HEIGHT_RANGES),
    weight: selectedOptionValue(searchParams, 'weight', WEIGHT_RANGES),
  }
}

export function filtersToSearchParams(filters: LikenessFilters): URLSearchParams {
  const searchParams = new URLSearchParams()

  const appendValues = (key: ArrayFilterKey) => {
    for (const value of filters[key]) searchParams.append(key, value)
  }

  if (filters.query.trim()) searchParams.set('q', filters.query.trim())

  appendValues('ethnicity')
  appendValues('eyeColor')
  appendValues('hairColor')
  appendValues('union')
  appendValues('licenseType')
  appendValues('permittedUse')

  if (filters.height) searchParams.set('height', filters.height)
  if (filters.weight) searchParams.set('weight', filters.weight)

  return searchParams
}

export function getActiveFilterCount(filters: LikenessFilters): number {
  return (
    (filters.query.trim() ? 1 : 0) +
    filters.ethnicity.length +
    filters.eyeColor.length +
    filters.hairColor.length +
    filters.union.length +
    filters.licenseType.length +
    filters.permittedUse.length +
    (filters.height ? 1 : 0) +
    (filters.weight ? 1 : 0)
  )
}

export function toLikenessItems(contentItems: ContentItem[], contractAddress: string): LikenessItem[] {
  return contentItems.flatMap((item) => {
    const metadata = item.metadata
    if (metadata?.type !== 'likeness') return []

    const profile = metadata.profile
    const attributes = profile?.attributes
    const licensing = metadata.licensing
    const name = profile?.fullLegalName ?? ''
    const bio = profile?.bio ?? ''
    const heightFt = Number(attributes?.heightFt)
    const heightIn = Number(attributes?.heightIn)
    const heightInches = (Number.isFinite(heightFt) ? heightFt : 0) * 12 + (Number.isFinite(heightIn) ? heightIn : 0)
    const weight = Number(attributes?.weight)

    return [
      {
        id: item.id,
        name,
        bio,
        imageUrl: getPreviewUrl(contractAddress, item.id, 'headshot_1'),
        filterData: {
          ethnicity: attributes?.ethnicity ?? '',
          heightInches: heightInches > 0 ? heightInches : null,
          weightLbs: Number.isFinite(weight) && weight > 0 ? weight : null,
          eyeColor: attributes?.eyeColor ?? '',
          hairColor: attributes?.hairColor ?? '',
          unions: getAffiliationUnions(profile?.affiliations),
          licenseTypes: getEnabledKeys(licensing?.licenseTypes),
          permittedUses: getEnabledKeys(licensing?.permittedUses),
        },
      },
    ]
  })
}

export function getRecentLikenesses(items: LikenessItem[]): LikenessItem[] {
  return items.slice(0, RECENT_LIMIT)
}

export function filterLikenessItems(items: LikenessItem[], filters: LikenessFilters): LikenessItem[] {
  return items.filter((item) => {
    const filterData = item.filterData ?? getFallbackFilterData()

    if (!matchesSearchQuery(item, filters.query)) return false
    if (!hasMatchingValue(filterData.ethnicity, filters.ethnicity, ETHNICITY_LABELS)) return false
    if (!hasMatchingValue(filterData.eyeColor, filters.eyeColor, EYE_COLOR_LABELS)) return false
    if (!hasMatchingValue(filterData.hairColor, filters.hairColor, HAIR_COLOR_LABELS)) return false
    if (!hasMatchingList(filterData.unions, filters.union, UNION_LABELS)) return false
    if (!hasMatchingList(filterData.licenseTypes, filters.licenseType, LICENSE_TYPE_LABELS)) return false
    if (!hasMatchingList(filterData.permittedUses, filters.permittedUse, PERMITTED_USE_LABELS)) return false
    if (!matchesRange(filterData.heightInches, filters.height, HEIGHT_RANGES)) return false
    if (!matchesRange(filterData.weightLbs, filters.weight, WEIGHT_RANGES)) return false

    return true
  })
}
