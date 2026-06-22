import { goto } from '$app/navigation'
import { DEFAULT_IMAGE_URL, createEmptyLikenessFilters, filtersToSearchParams, type LikenessFilters } from './likeness'
import type { FilterMenu } from './LikenessDashboard.types'

export function cloneFilters(value: LikenessFilters): LikenessFilters {
  return {
    ...value,
    ethnicity: [...value.ethnicity],
    eyeColor: [...value.eyeColor],
    hairColor: [...value.hairColor],
    union: [...value.union],
    licenseType: [...value.licenseType],
    permittedUse: [...value.permittedUse],
  }
}

export function getMenuCount(filters: LikenessFilters, menu: FilterMenu): number {
  switch (menu) {
    case 'ethnicity':
      return filters.ethnicity.length
    case 'height':
      return filters.height ? 1 : 0
    case 'weight':
      return filters.weight ? 1 : 0
    case 'eyeColor':
      return filters.eyeColor.length
    case 'hairColor':
      return filters.hairColor.length
    case 'union':
      return filters.union.length
    case 'licenseType':
      return filters.licenseType.length
    case 'permittedUse':
      return filters.permittedUse.length
  }
}

export function filterButtonClasses(active: boolean): string {
  return [
    'inline-flex h-9 items-center gap-2 rounded-sm border px-3.5 text-sm font-semibold transition-colors',
    active ? 'border-[#d6d0c8] bg-[#efebe5] text-dark' : 'border-[#ddd8d1] bg-[#f8f5f1] text-[#77757d]',
  ].join(' ')
}

export function optionClasses(selected: boolean): string {
  return [
    'rounded-full border px-4 py-2 text-sm font-semibold transition-colors',
    selected ? 'border-primary bg-[#eee8ff] text-primary' : 'border-[#e4ded6] bg-[#efebe5] text-[#77757d]',
  ].join(' ')
}

export function useDefaultImage(event: Event) {
  const image = event.currentTarget as HTMLImageElement
  if (image.src !== DEFAULT_IMAGE_URL) image.src = DEFAULT_IMAGE_URL
}

export function updateLikenessFilterUrl(filters: LikenessFilters) {
  const searchParams = filtersToSearchParams(filters)
  const query = searchParams.toString()
  const nextUrl = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`
  void goto(nextUrl, { replaceState: true, noScroll: true, keepFocus: true })
}

export function emptyFilters(): LikenessFilters {
  return createEmptyLikenessFilters()
}
