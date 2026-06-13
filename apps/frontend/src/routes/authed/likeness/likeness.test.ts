import { describe, expect, it } from 'vitest'
import { DEFAULT_IMAGE_URL, RECENT_LIMIT, getPreviewUrl, getRecentLikenesses, toLikenessItems } from './likeness'

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

    expect(items).toEqual([
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
})
