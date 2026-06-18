import { describe, expect, it } from 'vitest'
import {
  DEFAULT_IMAGE_URL,
  RECENT_LIMIT,
  createEmptyLikenessFilters,
  filterLikenessItems,
  filtersToSearchParams,
  getPreviewUrl,
  getRecentLikenesses,
  parseLikenessFilters,
  toLikenessItems,
  type LikenessFilters,
  type LikenessItem,
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

  it('maps metadata needed by likeness search filters', () => {
    const [item] = toLikenessItems(
      [
        {
          id: 'likeness-1',
          metadata: {
            type: 'likeness',
            profile: {
              fullLegalName: 'Avery Stone',
              stageName: 'Ace',
              bio: 'Actor and vocalist.',
              attributes: {
                ethnicity: 'white_or_caucasian',
                heightFt: '5',
                heightIn: '10',
                weight: '165',
                eyeColor: 'brown',
                hairColor: 'black',
              },
              affiliations: [{ union: 'SAG-AFTRA', memberId: '12345' }],
            },
            licensing: {
              licenseTypes: { 'single-use': true, perpetual: false },
              permittedUses: { ai: true, commercial: true },
            },
          },
        },
      ],
      CONTRACT_ADDRESS,
    )

    const filterData = item.filterData
    expect(filterData).toMatchObject({
      ethnicity: 'white_or_caucasian',
      heightInches: 70,
      weightLbs: 165,
      eyeColor: 'brown',
      hairColor: 'black',
      unions: ['SAG-AFTRA'],
      licenseTypes: ['single-use'],
      permittedUses: ['ai', 'commercial'],
    })
    expect(filterData?.searchText).toContain('avery-stone')
    expect(filterData?.searchText).toContain('ace')
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
      filterData: {
        ethnicity: '',
        heightInches: null,
        weightLbs: null,
        eyeColor: '',
        hairColor: '',
        unions: [],
        licenseTypes: [],
        permittedUses: [],
        searchText: `name-${index}`,
      },
    }))

    expect(getRecentLikenesses(items)).toHaveLength(RECENT_LIMIT)
    expect(items).toHaveLength(RECENT_LIMIT + 3)
  })

  it('parses and serializes shareable likeness filter query params', () => {
    const filters = parseLikenessFilters(
      new URLSearchParams(
        'q=avery&ethnicity=asian&ethnicity=unknown&eyeColor=brown&licenseType=single-use&height=5-8-6-0&weight=unknown',
      ),
    )

    expect(filters).toMatchObject({
      q: 'avery',
      ethnicity: ['asian'],
      eyeColor: ['brown'],
      licenseType: ['single-use'],
      height: '5-8-6-0',
      weight: null,
    })
    expect(filtersToSearchParams(filters).toString()).toBe(
      'q=avery&ethnicity=asian&eyeColor=brown&licenseType=single-use&height=5-8-6-0',
    )
  })

  it('filters likenesses by query, metadata options, and selected ranges', () => {
    const avery = createItem({
      id: '1',
      searchText: 'avery-stone actor',
      ethnicity: 'white_or_caucasian',
      heightInches: 70,
      weightLbs: 165,
      eyeColor: 'brown',
      hairColor: 'black',
      unions: ['SAG-AFTRA'],
      licenseTypes: ['single-use'],
      permittedUses: ['ai', 'digital'],
    })
    const mikey = createItem({
      id: '2',
      searchText: 'mikey-berry producer',
      ethnicity: 'asian',
      heightInches: 66,
      weightLbs: 190,
      eyeColor: 'blue',
      hairColor: 'brown',
      unions: ['WGA'],
      licenseTypes: ['perpetual'],
      permittedUses: ['commercial'],
    })

    const filters: LikenessFilters = {
      ...createEmptyLikenessFilters(),
      q: 'avery',
      ethnicity: ['white_or_caucasian'],
      height: '5-8-6-0',
      weight: '155-175',
      union: ['SAG-AFTRA'],
      licenseType: ['single-use'],
      permittedUse: ['ai'],
    }

    expect(filterLikenessItems([avery, mikey], filters)).toEqual([avery])
  })
})

function createItem(filterData: NonNullable<LikenessItem['filterData']> & { id: string }): LikenessItem {
  return {
    id: filterData.id,
    name: filterData.searchText,
    bio: '',
    imageUrl: DEFAULT_IMAGE_URL,
    filterData,
  }
}
