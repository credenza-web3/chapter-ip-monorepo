import { expect, test } from 'vitest'
import { render } from 'vitest-browser-svelte'
import CatalogDashboard from './CatalogDashboard.svelte'

test('renders mocked disabled sections and an active likeness dashboard link', async () => {
  const screen = await render(CatalogDashboard, {
    likenessItems: [
      {
        id: 'likeness-1',
        name: 'Avery Stone',
        bio: 'Actor and vocalist.',
        imageUrl: '/avery.jpg',
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
  expect(document.querySelectorAll('[aria-disabled="true"]')).toHaveLength(2)
  expect(document.querySelectorAll('a[href="/authed/likeness/likeness-1"]')).toHaveLength(1)
  expect(document.querySelector('img[alt="Avery Stone"]')?.getAttribute('src')).toBe('/avery.jpg')
})

test('renders an empty likeness state when likeness content is not available', async () => {
  const screen = await render(CatalogDashboard, {
    likenessItems: [],
  })

  await expect.element(screen.getByText('No likeness available yet.')).toBeVisible()
})
