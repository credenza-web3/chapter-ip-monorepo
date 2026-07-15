import { describe, expect, it } from 'vitest'
import { r2BaseConfig } from '@repo/fe-services'
import {
  DEFAULT_IMAGE_URL,
  RECENT_LIMIT,
  buildLocationFilterInput,
  buildLocationFindContentInput,
  createEmptyLocationFilters,
  getPreviewUrl,
  getRecentLocations,
  parseLocationFilters,
  toLocationItems,
  type LocationFilters,
} from './location'

const CONTRACT_ADDRESS = '0xcontent'

describe('location data helpers', () => {
  it('maps location metadata with the location preview and excludes other content types', () => {
    const items = toLocationItems(
      [
        {
          id: 'location-1',
          metadata: {
            type: 'location',
            name: 'Madison Square Garden',
            description: 'A landmark arena.',
            file_name: 'location_1.jpg',
          },
        },
        { id: 'other', metadata: { type: 'likeness' } },
      ],
      CONTRACT_ADDRESS,
    )

    expect(items).toMatchObject([
      {
        id: 'location-1',
        name: 'Madison Square Garden',
        description: 'A landmark arena.',
        imageUrl: getPreviewUrl(CONTRACT_ADDRESS, 'location-1', 'location_1.jpg'),
      },
    ])
  })

  it('picks the first file_name as imageUrl when file_names is present', () => {
    const items = toLocationItems(
      [
        {
          id: 'location-multi',
          metadata: {
            type: 'location',
            name: 'Multi Photo',
            description: 'Has multiple photos.',
            file_name: 'multi-photo-1.jpg',
            file_names: ['multi-photo-1.jpg', 'multi-photo-2.jpg', 'multi-photo-3.jpg'],
          },
        },
      ],
      CONTRACT_ADDRESS,
    )

    expect(items).toMatchObject([
      {
        id: 'location-multi',
        name: 'Multi Photo',
        imageUrl: getPreviewUrl(CONTRACT_ADDRESS, 'location-multi', 'multi-photo-1.jpg'),
      },
    ])
  })

  it('uses the default image when file_name is missing', () => {
    const items = toLocationItems(
      [
        {
          id: 'location-2',
          metadata: {
            type: 'location',
            name: 'Empty Preview',
            description: 'No preview file yet.',
          },
        },
      ],
      CONTRACT_ADDRESS,
    )

    expect(items).toMatchObject([
      {
        id: 'location-2',
        name: 'Empty Preview',
        imageUrl: DEFAULT_IMAGE_URL,
      },
    ])
  })

  it('builds preview URLs from the contract, content id, and technical filename', () => {
    expect(getPreviewUrl(CONTRACT_ADDRESS, 'location-1', 'location_1')).toBe(
      `${r2BaseConfig.previewUrl}/0xcontent/location-1/location_1`,
    )
  })

  it('limits recent locations without changing grid items', () => {
    const items = Array.from({ length: RECENT_LIMIT + 3 }, (_, index) => ({
      id: String(index),
      name: `Name ${index}`,
      description: '',
      imageUrl: DEFAULT_IMAGE_URL,
    }))

    expect(getRecentLocations(items)).toHaveLength(RECENT_LIMIT)
    expect(items).toHaveLength(RECENT_LIMIT + 3)
  })

  it('builds a backend-compatible findContent query with the location metadata filter', () => {
    expect(buildLocationFindContentInput(CONTRACT_ADDRESS)).toEqual({
      contractAddress: CONTRACT_ADDRESS,
      metadata: { and: [{ field: 'type', op: 'eq', val: 'location' }] },
      sort: 'createdAt',
      order: 'desc',
      status: 'ACTIVE',
    })
  })

  it('parses location search query params', () => {
    expect(parseLocationFilters(new URLSearchParams('q=Madison'))).toEqual({
      query: 'Madison',
    })
    expect(parseLocationFilters(new URLSearchParams())).toEqual(createEmptyLocationFilters())
  })

  it('builds the backend filter tree from location search filters', () => {
    const filters: LocationFilters = {
      ...createEmptyLocationFilters(),
      query: 'Madison',
    }

    expect(buildLocationFilterInput(filters)).toEqual({
      and: [
        { field: 'type', op: 'eq', val: 'location' },
        {
          or: [
            { field: 'name', op: 'regex', val: '[mM][aA][dD][iI][sS][oO][nN]' },
            { field: 'description', op: 'regex', val: '[mM][aA][dD][iI][sS][oO][nN]' },
          ],
        },
      ],
    })
  })
})
