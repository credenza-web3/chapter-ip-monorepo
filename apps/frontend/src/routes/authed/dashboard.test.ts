import { describe, expect, it } from 'vitest'
import { DEFAULT_IMAGE_URL } from './likeness/likeness'
import { MOCK_CREATIVE_WORKS, toDashboardCards, toLocationDashboardCards } from './dashboard'

describe('dashboard helpers', () => {
  it('keeps mocked unavailable creative works populated for preview cards', () => {
    expect(MOCK_CREATIVE_WORKS).toHaveLength(5)
    expect(MOCK_CREATIVE_WORKS.every((item) => item.imageUrl === DEFAULT_IMAGE_URL)).toBe(true)
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
      imageUrl: '/image-0.jpg',
    })
    expect(cards[1]?.description).toBe('No biography available yet.')
  })

  it('maps locations into a five-card dashboard preview', () => {
    const cards = toLocationDashboardCards(
      Array.from({ length: 7 }, (_, index) => ({
        id: String(index),
        name: index === 0 ? '' : `Location ${index}`,
        description: index === 1 ? '' : `Description ${index}`,
        imageUrl: `/location-${index}.jpg`,
      })),
    )

    expect(cards).toHaveLength(5)
    expect(cards[0]).toMatchObject({
      title: 'Unnamed location',
      description: 'Description 0',
      imageUrl: '/location-0.jpg',
    })
    expect(cards[1]?.description).toBe('No description available yet.')
  })
})
