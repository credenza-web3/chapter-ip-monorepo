import { afterEach, expect, test, vi } from 'vitest'
import { render } from 'vitest-browser-svelte'
import type { AppRouter, TRPCClient } from '@repo/trpc/client'
import LikenessDashboard from './LikenessDashboard.svelte'

class IntersectionObserverStub implements IntersectionObserver {
  static instances: IntersectionObserverStub[] = []

  readonly root = null
  readonly rootMargin = '240px'
  readonly scrollMargin = '0px'
  readonly thresholds = [0]

  constructor(private callback: IntersectionObserverCallback) {
    IntersectionObserverStub.instances.push(this)
  }

  disconnect = vi.fn()
  observe = vi.fn()
  takeRecords = vi.fn(() => [])
  unobserve = vi.fn()

  intersect() {
    this.callback([{ isIntersecting: true } as IntersectionObserverEntry], this)
  }
}

afterEach(() => vi.unstubAllGlobals())

test('renders the recent strip and non-interactive likeness grid', async () => {
  const trpcClient = {
    contents: {
      getContentById: {
        query: vi.fn().mockResolvedValue({ files: [] }),
      },
    },
  } as unknown as TRPCClient<AppRouter>

  const screen = await render(LikenessDashboard, {
    items: [
      {
        id: '1',
        name: 'Avery Stone',
        bio: 'A long biography that should stay visually constrained inside the card layout.',
        headshotFilename: null,
      },
    ],
    trpcClient,
  })

  await expect.element(screen.getByRole('heading', { name: 'Recently added' })).toBeVisible()
  await expect.element(screen.getByRole('heading', { name: 'Likeness' })).toBeVisible()
  await expect.element(screen.getByText('Avery Stone').first()).toBeVisible()
  expect(document.querySelectorAll('a')).toHaveLength(0)
})

test('loads a headshot only after intersection and deduplicates recent and grid requests', async () => {
  IntersectionObserverStub.instances = []
  vi.stubGlobal('IntersectionObserver', IntersectionObserverStub)

  const query = vi.fn().mockResolvedValue({
    files: [{ filename: 'headshot.jpg', label: '', key: 'contract/content/headshot.jpg' }],
  })
  const trpcClient = {
    contents: {
      getContentById: { query },
    },
  } as unknown as TRPCClient<AppRouter>

  await render(LikenessDashboard, {
    items: [
      {
        id: '1',
        name: 'Avery Stone',
        bio: '',
        headshotFilename: 'headshot.jpg',
      },
    ],
    trpcClient,
  })

  expect(query).not.toHaveBeenCalled()
  expect(IntersectionObserverStub.instances).toHaveLength(2)

  IntersectionObserverStub.instances.forEach((observer) => observer.intersect())

  await vi.waitFor(() => expect(query).toHaveBeenCalledTimes(1))
})
