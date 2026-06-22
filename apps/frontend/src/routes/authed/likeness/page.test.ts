import { describe, expect, it, vi } from 'vitest'
import { RECENT_LIMIT } from './likeness'

const CONTRACT_ADDRESS = '0xcontent'

vi.mock('$lib/stores/config.svelte', () => ({
  ContractName: { CONTENT_NFT: 'CONTENT_NFT' },
  configStore: {
    getContractAddress: vi.fn(() => CONTRACT_ADDRESS),
  },
}))

describe('likeness page load', () => {
  it('loads filtered grid items separately from unfiltered recent items', async () => {
    const { load } = await import('./+page')
    const query = vi
      .fn()
      .mockResolvedValueOnce({
        items: [
          {
            id: 'filtered-1',
            metadata: {
              type: 'likeness',
              profile: { fullLegalName: 'Filtered Name', bio: 'Filtered bio' },
            },
          },
        ],
      })
      .mockResolvedValueOnce({
        items: [
          {
            id: 'recent-1',
            metadata: {
              type: 'likeness',
              profile: { fullLegalName: 'Recent Name', bio: 'Recent bio' },
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
      url: new URL('https://example.test/authed/likeness?ethnicity=asian'),
    } as unknown as Parameters<typeof load>[0]

    const data = await load(event)

    expect(query).toHaveBeenCalledTimes(2)
    expect(query).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        metadata: expect.objectContaining({
          and: expect.arrayContaining([
            {
              or: [{ field: 'profile.attributes.ethnicity', op: 'eq', val: 'asian' }],
            },
          ]),
        }),
      }),
    )
    expect(query).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        limit: String(RECENT_LIMIT),
        metadata: { and: [{ field: 'type', op: 'eq', val: 'likeness' }] },
      }),
    )
    expect(data.likenessItems).toMatchObject([{ id: 'filtered-1', name: 'Filtered Name' }])
    expect(data.recentLikenessItems).toMatchObject([{ id: 'recent-1', name: 'Recent Name' }])
  })
})
