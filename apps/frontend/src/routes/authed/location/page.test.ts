import { describe, expect, it, vi } from 'vitest'
import { RECENT_LIMIT } from './location'

const CONTRACT_ADDRESS = '0xcontent'

vi.mock('$lib/stores/config.svelte', () => ({
  ContractName: { CONTENT_NFT: 'CONTENT_NFT' },
  configStore: {
    getContractAddress: vi.fn(() => CONTRACT_ADDRESS),
  },
}))

describe('location page load', () => {
  it('loads grid items separately from limited recent items', async () => {
    const { load } = await import('./+page')
    const query = vi
      .fn()
      .mockResolvedValueOnce({
        items: [
          {
            id: 'grid-1',
            metadata: {
              type: 'location',
              name: 'Grid Location',
              description: 'Grid description',
              preview_file_name: 'grid.jpg',
            },
          },
        ],
      })
      .mockResolvedValueOnce({
        items: [
          {
            id: 'recent-1',
            metadata: {
              type: 'location',
              name: 'Recent Location',
              description: 'Recent description',
              preview_file_name: 'recent.jpg',
            },
          },
        ],
      })
    const event = {
      parent: async () => ({
        trpcClient: {
          contents: {
            findContent: { query },
          },
        },
      }),
      url: new URL('https://example.test/authed/location'),
    } as unknown as Parameters<typeof load>[0]

    const data = await load(event)

    expect(query).toHaveBeenCalledTimes(2)
    expect(query).toHaveBeenNthCalledWith(1, {
      contractAddress: CONTRACT_ADDRESS,
      metadata: { and: [{ field: 'type', op: 'eq', val: 'location' }] },
      sort: 'createdAt',
      order: 'desc',
      status: 'ACTIVE',
    })
    expect(query).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        limit: String(RECENT_LIMIT),
        metadata: { and: [{ field: 'type', op: 'eq', val: 'location' }] },
      }),
    )
    expect(data.locationItems).toMatchObject([{ id: 'grid-1', name: 'Grid Location' }])
    expect(data.recentLocationItems).toMatchObject([{ id: 'recent-1', name: 'Recent Location' }])
  })

  it('loads filtered grid items separately from unfiltered recent items', async () => {
    const { load } = await import('./+page')
    const query = vi
      .fn()
      .mockResolvedValueOnce({
        items: [
          {
            id: 'filtered-1',
            metadata: {
              type: 'location',
              name: 'Madison Square Garden',
              description: 'Filtered description',
              preview_file_name: 'filtered.jpg',
            },
          },
        ],
      })
      .mockResolvedValueOnce({
        items: [
          {
            id: 'recent-1',
            metadata: {
              type: 'location',
              name: 'Recent Location',
              description: 'Recent description',
              preview_file_name: 'recent.jpg',
            },
          },
        ],
      })
    const event = {
      parent: async () => ({
        trpcClient: {
          contents: {
            findContent: { query },
          },
        },
      }),
      url: new URL('https://example.test/authed/location?q=Madison'),
    } as unknown as Parameters<typeof load>[0]

    const data = await load(event)

    expect(query).toHaveBeenCalledTimes(2)
    expect(query).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        metadata: expect.objectContaining({
          and: expect.arrayContaining([
            {
              or: [
                { field: 'name', op: 'regex', val: '[mM][aA][dD][iI][sS][oO][nN]' },
                { field: 'description', op: 'regex', val: '[mM][aA][dD][iI][sS][oO][nN]' },
              ],
            },
          ]),
        }),
      }),
    )
    expect(query).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        limit: String(RECENT_LIMIT),
        metadata: { and: [{ field: 'type', op: 'eq', val: 'location' }] },
      }),
    )
    expect(data.filters).toEqual({ query: 'Madison' })
    expect(data.locationItems).toMatchObject([{ id: 'filtered-1', name: 'Madison Square Garden' }])
    expect(data.recentLocationItems).toMatchObject([{ id: 'recent-1', name: 'Recent Location' }])
  })
})
