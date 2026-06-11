import { expect, test, vi } from 'vitest'
import { render } from 'vitest-browser-svelte'
import LikenessDashboard from './LikenessDashboard.svelte'

test('renders the recent strip and links likeness cards to purchase pages', async () => {
  const screen = await render(LikenessDashboard, {
    items: [
      {
        id: '1',
        name: 'Avery Stone',
        bio: 'A long biography that should stay visually constrained inside the card layout.',
        imageUrl: '/headshot.jpg',
      },
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
      {
        id: '1',
        name: 'Avery Stone',
        bio: '',
        imageUrl: '/content/headshot.jpg',
      },
    ],
  })

  expect(query).not.toHaveBeenCalled()
  expect(document.querySelectorAll('img[src="/content/headshot.jpg"]')).toHaveLength(2)
})
