import { describe, expect, it } from 'vitest'
import { DEFAULT_IMAGE_URL, RECENT_LIMIT, getRecentLikenesses, toLikenessItems } from './likeness'

describe('likeness data helpers', () => {
  it('maps likeness metadata with the default image and excludes other content types', () => {
    const items = toLikenessItems([
      {
        id: 'likeness-1',
        metadata: {
          type: 'likeness',
          profile: { fullLegalName: 'Avery Stone', bio: 'Actor and vocalist.' },
        },
        files: [
          {
            filename: 'headshot.jpg',
            label: '',
            key: 'contract/content/headshot.jpg',
            url: 'https://cdn.example.test/contract/content/headshot.jpg',
          },
        ],
      },
      { id: 'other', metadata: { type: 'written-work' } },
    ])

    expect(items).toEqual([
      {
        id: 'likeness-1',
        name: 'Avery Stone',
        bio: 'Actor and vocalist.',
        imageUrl: DEFAULT_IMAGE_URL,
      },
    ])
  })

  it('uses the default image while the file image contract is unsettled', () => {
    const items = toLikenessItems([
      {
        id: 'likeness-1',
        metadata: {
          type: 'likeness',
          profile: { fullLegalName: 'Avery Stone' },
        },
        files: [
          {
            filename: 'headshot.jpg',
            label: '',
            key: 'contract/content/headshot.jpg',
            url: 'https://cdn.example.test/contract/content/headshot.jpg',
          },
        ],
      },
    ])

    expect(items[0]?.imageUrl).toBe(DEFAULT_IMAGE_URL)
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
