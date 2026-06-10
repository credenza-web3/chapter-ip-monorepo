import { describe, expect, it } from 'vitest'
import { DEFAULT_IMAGE_URL } from './likeness/likeness'
import { MOCK_CREATIVE_WORKS, MOCK_LOCATIONS, toDashboardCards } from './dashboard'

describe('dashboard helpers', () => {
  it('keeps mocked unavailable sections populated for preview cards', () => {
    expect(MOCK_CREATIVE_WORKS).toHaveLength(5)
    expect(MOCK_LOCATIONS).toHaveLength(5)
    expect([...MOCK_CREATIVE_WORKS, ...MOCK_LOCATIONS].every((item) => item.imageUrl === DEFAULT_IMAGE_URL)).toBe(true)
  })

  it('maps likenesses into a five-card dashboard preview', () => {
    const cards = toDashboardCards(
      Array.from({ length: 7 }, (_, index) => ({
        id: String(index),
        name: index === 0 ? '' : `Name ${index}`,
        bio: index === 1 ? '' : `Bio ${index}`,
        imageUrl: `/image-${index}.jpg`,
      })),
    )

    expect(cards).toHaveLength(5)
    expect(cards[0]).toMatchObject({
      title: 'Unnamed likeness',
      description: 'Bio 0',
      imageUrl: DEFAULT_IMAGE_URL,
    })
    expect(cards[1]?.description).toBe('No biography available yet.')
  })
})
