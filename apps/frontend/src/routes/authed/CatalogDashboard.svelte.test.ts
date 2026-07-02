import { expect, test } from 'vitest'
import { render } from 'vitest-browser-svelte'
import CatalogDashboard from './CatalogDashboard.svelte'

test('renders active likeness and location dashboard links with real cards', async () => {
  const screen = await render(CatalogDashboard, {
    likenessItems: [
      {
        id: 'likeness-1',
        name: 'Avery Stone',
        bio: 'Actor and vocalist.',
        imageUrl: '/avery.jpg',
      },
    ],
    locationItems: [
      {
        id: 'location-1',
        name: 'Madison Square Garden',
        description: 'A landmark arena.',
        imageUrl: '/msg.jpg',
      },
    ],
  })

  await expect.element(screen.getByRole('heading', { name: 'ChapterIP' })).toBeVisible()
  await expect.element(screen.getByRole('heading', { name: 'Creative Works' })).toBeVisible()
  await expect.element(screen.getByRole('heading', { name: 'Locations' })).toBeVisible()
  await expect.element(screen.getByRole('heading', { name: 'Likeness' })).toBeVisible()
  await expect
    .element(screen.getByRole('link', { name: 'View all Likenesses' }))
    .toHaveAttribute('href', '/authed/likeness')
  await expect
    .element(screen.getByRole('link', { name: 'View all Locations' }))
    .toHaveAttribute('href', '/authed/location')
  expect(document.querySelectorAll('[aria-disabled="true"]')).toHaveLength(1)
  expect(document.querySelectorAll('a[href="/authed/likeness/likeness-1"]')).toHaveLength(1)
  expect(document.querySelectorAll('a[href="/authed/location/location-1"]')).toHaveLength(0)
  expect(document.querySelector('img[alt="Avery Stone"]')?.getAttribute('src')).toBe('/avery.jpg')
  expect(document.querySelector('img[alt="Madison Square Garden"]')?.getAttribute('src')).toBe('/msg.jpg')
})

test('renders empty states when likeness and location content are not available', async () => {
  const screen = await render(CatalogDashboard, {
    likenessItems: [],
    locationItems: [],
  })

  await expect.element(screen.getByText('No likeness available yet.')).toBeVisible()
  await expect.element(screen.getByText('No locations available yet.')).toBeVisible()
})
