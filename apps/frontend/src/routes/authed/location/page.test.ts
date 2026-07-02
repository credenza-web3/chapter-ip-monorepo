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
              file_name: 'grid.jpg',
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
              file_name: 'recent.jpg',
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
})
