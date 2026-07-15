import { expect, test, vi } from 'vitest'
import { render } from 'vitest-browser-svelte'
import LocationDashboard from './LocationDashboard.svelte'
import { DEFAULT_IMAGE_URL, type LocationItem } from './location'

test('renders the recent strip and location cards without detail links', async () => {
  const screen = await render(LocationDashboard, {
    items: [
      createItem({
        id: '1',
        name: 'Madison Square Garden',
        description: 'A landmark arena ready for premium licensing opportunities.',
        imageUrl: '/location.jpg',
      }),
    ],
  })

  await expect.element(screen.getByRole('heading', { name: 'Recently added' })).toBeVisible()
  await expect.element(screen.getByRole('heading', { name: 'Location' })).toBeVisible()
  await expect.element(screen.getByText('Madison Square Garden').first()).toBeVisible()
  expect(document.querySelectorAll('a[href="/authed/location/1"]')).toHaveLength(0)
  expect(document.querySelectorAll('img[alt="Madison Square Garden"]')).toHaveLength(2)
})

test('renders images from findContent items without lazy content lookups', async () => {
  const query = vi.fn().mockResolvedValue({
    files: [{ filename: 'location.jpg', label: '', key: 'contract/content/location.jpg' }],
  })

  await render(LocationDashboard, {
    items: [
      createItem({
        id: '1',
        name: 'Madison Square Garden',
        description: '',
        imageUrl: '/content/location.jpg',
      }),
    ],
  })

  expect(query).not.toHaveBeenCalled()
  expect(document.querySelectorAll('img[src="/content/location.jpg"]')).toHaveLength(2)
})

test('renders grid items separately from recent items', async () => {
  const screen = await render(LocationDashboard, {
    items: [
      createItem({
        id: '2',
        name: 'Grid Location',
      }),
    ],
    recentItems: [
      createItem({
        id: '1',
        name: 'Recent Location',
      }),
    ],
  })

  const locationSection = screen.getByRole('region', { name: 'Location' })

  await expect.element(locationSection.getByRole('heading', { name: 'Grid Location' })).toBeVisible()
  await expect.element(locationSection.getByRole('heading', { name: 'Recent Location' })).not.toBeInTheDocument()
  await expect.element(screen.getByRole('heading', { name: 'Recent Location' })).toBeVisible()
})

function createItem(item: { id: string; name: string; description?: string; imageUrl?: string }): LocationItem {
  return {
    id: item.id,
    name: item.name,
    description: item.description ?? '',
    imageUrl: item.imageUrl ?? DEFAULT_IMAGE_URL,
    imageUrls: [],
  }
}
