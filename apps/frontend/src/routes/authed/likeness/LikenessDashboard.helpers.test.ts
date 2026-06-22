import { describe, expect, it } from 'vitest'
import { cloneFilters, getMenuCount } from './LikenessDashboard.helpers'
import { createEmptyLikenessFilters, type LikenessFilters } from './likeness'

describe('LikenessDashboard helpers', () => {
  it('clones array filter values so callers can mutate safely', () => {
    const filters: LikenessFilters = {
      ...createEmptyLikenessFilters(),
      ethnicity: ['asian'],
      licenseType: ['single-use'],
    }
    const clone = cloneFilters(filters)

    clone.ethnicity.push('white_or_caucasian')
    clone.licenseType.pop()

    expect(filters.ethnicity).toEqual(['asian'])
    expect(filters.licenseType).toEqual(['single-use'])
  })

  it('counts the active options in each filter menu', () => {
    const filters: LikenessFilters = {
      ...createEmptyLikenessFilters(),
      ethnicity: ['asian', 'white_or_caucasian'],
      height: '5-8-6-0',
      weight: '155-175',
      eyeColor: ['brown'],
      permittedUse: ['ai', 'commercial'],
    }

    expect(getMenuCount(filters, 'ethnicity')).toBe(2)
    expect(getMenuCount(filters, 'height')).toBe(1)
    expect(getMenuCount(filters, 'weight')).toBe(1)
    expect(getMenuCount(filters, 'eyeColor')).toBe(1)
    expect(getMenuCount(filters, 'hairColor')).toBe(0)
    expect(getMenuCount(filters, 'union')).toBe(0)
    expect(getMenuCount(filters, 'licenseType')).toBe(0)
    expect(getMenuCount(filters, 'permittedUse')).toBe(2)
  })
})
