import { expect, test, vi } from 'vitest'
import { render } from 'vitest-browser-svelte'
import LikenessDashboard from './LikenessDashboard.svelte'
import { DEFAULT_IMAGE_URL, createEmptyLikenessFilters, type LikenessItem } from './likeness'

test('renders the recent strip and links likeness cards to purchase pages', async () => {
  const screen = await render(LikenessDashboard, {
    items: [
      createItem({
        id: '1',
        name: 'Avery Stone',
        bio: 'A long biography that should stay visually constrained inside the card layout.',
        imageUrl: '/headshot.jpg',
      }),
    ],
  })

  await expect.element(screen.getByRole('heading', { name: 'Recently added' })).toBeVisible()
  await expect.element(screen.getByRole('heading', { name: 'Likeness' })).toBeVisible()
  await expect.element(screen.getByText('Avery Stone').first()).toBeVisible()
  expect(document.querySelectorAll('a[href="/authed/likeness/1"]')).toHaveLength(2)
  expect(document.querySelectorAll('img[alt="Avery Stone"]')).toHaveLength(2)
})

test('renders images from findContent items without lazy content lookups', async () => {
  const query = vi.fn().mockResolvedValue({
    files: [{ filename: 'headshot.jpg', label: '', key: 'contract/content/headshot.jpg' }],
  })

  await render(LikenessDashboard, {
    items: [
      createItem({
        id: '1',
        name: 'Avery Stone',
        bio: '',
        imageUrl: '/content/headshot.jpg',
      }),
    ],
  })

  expect(query).not.toHaveBeenCalled()
  expect(document.querySelectorAll('img[src="/content/headshot.jpg"]')).toHaveLength(2)
})

test('renders backend-filtered grid items separately from recent items', async () => {
  const screen = await render(LikenessDashboard, {
    filters: {
      ...createEmptyLikenessFilters(),
      ethnicity: ['asian'],
    },
    items: [
      createItem({
        id: '2',
        name: 'Mikey Berry',
      }),
    ],
    recentItems: [
      createItem({
        id: '1',
        name: 'Avery Stone',
      }),
    ],
  })

  const likenessSection = screen.getByRole('region', { name: 'Likeness' })

  await expect.element(likenessSection.getByRole('heading', { name: 'Mikey Berry' })).toBeVisible()
  await expect.element(likenessSection.getByRole('heading', { name: 'Avery Stone' })).not.toBeInTheDocument()
  await expect.element(screen.getByRole('heading', { name: 'Avery Stone' })).toBeVisible()
})

function createItem(item: { id: string; name: string; bio?: string; imageUrl?: string }): LikenessItem {
  return {
    id: item.id,
    name: item.name,
    bio: item.bio ?? '',
    imageUrl: item.imageUrl ?? DEFAULT_IMAGE_URL,
  }
}
