import { describe, expect, it } from 'vitest'
import {
  DEFAULT_IMAGE_URL,
  RECENT_LIMIT,
  buildLikenessFilterInput,
  buildLikenessFindContentInput,
  createEmptyLikenessFilters,
  filtersToSearchParams,
  getPreviewUrl,
  getRecentLikenesses,
  parseLikenessFilters,
  toLikenessItems,
  type LikenessFilters,
} from './likeness'

const CONTRACT_ADDRESS = '0xcontent'

describe('likeness data helpers', () => {
  it('maps likeness metadata with the headshot preview and excludes other content types', () => {
    const items = toLikenessItems(
      [
        {
          id: 'likeness-1',
          metadata: {
            type: 'likeness',
            profile: { fullLegalName: 'Avery Stone', bio: 'Actor and vocalist.' },
          },
        },
        { id: 'other', metadata: { type: 'written-work' } },
      ],
      CONTRACT_ADDRESS,
    )

    expect(items).toMatchObject([
      {
        id: 'likeness-1',
        name: 'Avery Stone',
        bio: 'Actor and vocalist.',
        imageUrl: getPreviewUrl(CONTRACT_ADDRESS, 'likeness-1', 'headshot_1'),
      },
    ])
  })

  it('builds preview URLs from the contract, content id, and technical filename', () => {
    expect(getPreviewUrl(CONTRACT_ADDRESS, 'likeness-1', 'headshot_1')).toBe(
      'https://pub-1a5fde2f5a814d7bbcaca6562a705028.r2.dev/0xcontent/likeness-1/headshot_1',
    )
  })

  it('limits recent likenesses without changing grid items', () => {
    const items = Array.from({ length: RECENT_LIMIT + 3 }, (_, index) => ({
      id: String(index),
      name: `Name ${index}`,
      bio: '',
      imageUrl: DEFAULT_IMAGE_URL,
    }))

    expect(getRecentLikenesses(items)).toHaveLength(RECENT_LIMIT)
    expect(items).toHaveLength(RECENT_LIMIT + 3)
  })

  it('parses and serializes shareable likeness filter query params', () => {
    const filters = parseLikenessFilters(
      new URLSearchParams(
        'q=Toronto&ethnicity=asian&ethnicity=unknown&eyeColor=brown&licenseType=single-use&height=5-8-6-0&weight=unknown',
      ),
    )

    expect(filters).toMatchObject({
      query: 'Toronto',
      ethnicity: ['asian'],
      eyeColor: ['brown'],
      licenseType: ['single-use'],
      height: '5-8-6-0',
      weight: null,
    })
    expect(filtersToSearchParams(filters).toString()).toBe(
      'q=Toronto&ethnicity=asian&eyeColor=brown&licenseType=single-use&height=5-8-6-0',
    )
  })

  it('builds a backend-compatible findContent query while filter support is pending', () => {
    expect(buildLikenessFindContentInput(CONTRACT_ADDRESS)).toEqual({
      contractAddress: CONTRACT_ADDRESS,
      metadata: { type: 'likeness' },
      limit: '100',
      sort: 'createdAt',
      order: 'desc',
    })
  })

  it('builds the upcoming recursive backend filter tree from likeness filters', () => {
    const filters: LikenessFilters = {
      ...createEmptyLikenessFilters(),
      query: 'Toronto',
      ethnicity: ['white_or_caucasian', 'asian'],
      eyeColor: ['brown'],
      height: '5-8-6-0',
      weight: '155-175',
      union: ['SAG-AFTRA'],
      licenseType: ['single-use'],
      permittedUse: ['ai'],
    }

    expect(buildLikenessFilterInput(filters)).toEqual({
      filter: {
        and: [
          { field: 'type', op: 'eq', val: 'likeness' },
          {
            or: [
              { field: 'profile.fullLegalName', op: 'contains', val: 'Toronto' },
              { field: 'profile.stageName', op: 'contains', val: 'Toronto' },
              { field: 'profile.bio', op: 'contains', val: 'Toronto' },
            ],
          },
          {
            or: [
              { field: 'profile.attributes.ethnicity', op: 'eq', val: 'white_or_caucasian' },
              { field: 'profile.attributes.ethnicity', op: 'eq', val: 'asian' },
            ],
          },
          {
            or: [{ field: 'profile.attributes.eyeColor', op: 'eq', val: 'brown' }],
          },
          {
            or: [{ field: 'profile.affiliations.union', op: 'eq', val: 'SAG-AFTRA' }],
          },
          {
            or: [{ field: 'licensing.licenseTypes.single-use', op: 'eq', val: true }],
          },
          {
            or: [{ field: 'licensing.permittedUses.ai', op: 'eq', val: true }],
          },
          { field: 'profile.attributes.heightTotalInches', op: 'gte', val: 68 },
          { field: 'profile.attributes.heightTotalInches', op: 'lt', val: 72 },
          { field: 'profile.attributes.weight', op: 'gte', val: 155 },
          { field: 'profile.attributes.weight', op: 'lt', val: 175 },
        ],
      },
    })
  })
})
