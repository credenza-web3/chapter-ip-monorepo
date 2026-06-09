import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { AppRouter, TRPCClient } from '@repo/trpc/client'
import {
  DEFAULT_IMAGE_URL,
  RECENT_LIMIT,
  clearLikenessImageCache,
  getLikenessImageUrl,
  getRecentLikenesses,
  toLikenessItems,
} from './likeness'

function createClient(getContentById: ReturnType<typeof vi.fn>) {
  return {
    contents: {
      getContentById: {
        query: getContentById,
      },
    },
  } as unknown as TRPCClient<AppRouter>
}

describe('likeness data helpers', () => {
  beforeEach(() => clearLikenessImageCache())

  it('maps likeness metadata and excludes other content types', () => {
    const items = toLikenessItems([
      {
        id: 'likeness-1',
        metadata: {
          type: 'likeness',
          profile: { fullLegalName: 'Avery Stone', bio: 'Actor and vocalist.' },
          uploadsByBucket: { headshots: ['headshot.jpg'] },
        },
      },
      { id: 'other', metadata: { type: 'written-work' } },
    ])

    expect(items).toEqual([
      {
        id: 'likeness-1',
        name: 'Avery Stone',
        bio: 'Actor and vocalist.',
        headshotFilename: 'headshot.jpg',
      },
    ])
  })

  it('limits recent likenesses without changing grid items', () => {
    const items = Array.from({ length: RECENT_LIMIT + 3 }, (_, index) => ({
      id: String(index),
      name: `Name ${index}`,
      bio: '',
      headshotFilename: null,
    }))

    expect(getRecentLikenesses(items)).toHaveLength(RECENT_LIMIT)
    expect(items).toHaveLength(RECENT_LIMIT + 3)
  })

  it('builds the public image URL and deduplicates concurrent requests', async () => {
    const query = vi.fn().mockResolvedValue({
      files: [{ filename: 'headshot.jpg', label: '', key: 'contract/content/headshot.jpg' }],
    })
    const client = createClient(query)

    const [firstUrl, secondUrl] = await Promise.all([
      getLikenessImageUrl(client, 'content-1', 'headshot.jpg'),
      getLikenessImageUrl(client, 'content-1', 'headshot.jpg'),
    ])

    expect(firstUrl).toBe(secondUrl)
    expect(firstUrl).toContain('contract/content/headshot.jpg')
    expect(query).toHaveBeenCalledTimes(1)
  })

  it('does not reuse an image request after the headshot filename changes', async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({
        files: [{ filename: 'first.jpg', label: '', key: 'contract/content/first.jpg' }],
      })
      .mockResolvedValueOnce({
        files: [{ filename: 'second.jpg', label: '', key: 'contract/content/second.jpg' }],
      })
    const client = createClient(query)

    await expect(getLikenessImageUrl(client, 'content-1', 'first.jpg')).resolves.toContain('first.jpg')
    await expect(getLikenessImageUrl(client, 'content-1', 'second.jpg')).resolves.toContain('second.jpg')
    expect(query).toHaveBeenCalledTimes(2)
  })

  it('falls back on failure and allows a later retry', async () => {
    const query = vi
      .fn()
      .mockRejectedValueOnce(new Error('temporary failure'))
      .mockResolvedValueOnce({
        files: [{ filename: 'headshot.jpg', label: '', key: 'contract/content/retry.jpg' }],
      })
    const client = createClient(query)

    await expect(getLikenessImageUrl(client, 'content-2', 'headshot.jpg')).resolves.toBe(DEFAULT_IMAGE_URL)
    await expect(getLikenessImageUrl(client, 'content-2', 'headshot.jpg')).resolves.toContain('retry.jpg')
    expect(query).toHaveBeenCalledTimes(2)
  })
})
