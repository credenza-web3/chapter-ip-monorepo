import type { LikenessFilters } from './likeness'

export type FilterMenu =
  | 'ethnicity'
  | 'height'
  | 'weight'
  | 'eyeColor'
  | 'hairColor'
  | 'union'
  | 'licenseType'
  | 'permittedUse'

export type MultiFilterKey = 'ethnicity' | 'eyeColor' | 'hairColor' | 'union' | 'licenseType' | 'permittedUse'
export type FilterOption = { value: string; label: string }
export type HeightRangeValue = NonNullable<LikenessFilters['height']>
export type WeightRangeValue = NonNullable<LikenessFilters['weight']>
