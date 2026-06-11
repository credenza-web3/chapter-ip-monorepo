import { expect, test } from 'vitest'
import { render } from 'vitest-browser-svelte'
import { tick } from 'svelte'
import LikenessPurchasePage from './LikenessPurchasePage.svelte'
import type { LikenessPurchase } from './purchase'

const purchase: LikenessPurchase = {
  id: 'likeness-1',
  name: 'Avery Stone',
  stageName: 'Avery',
  bio: 'Actor and vocalist.',
  attributes: [{ label: 'Eye color', value: 'Brown' }],
  affiliations: [{ union: 'SAG-AFTRA', memberId: '12345' }],
  licenses: [
    {
      id: 'single-use',
      name: 'Single-use campaign',
      price: '10',
      detail: '',
      description: 'One approved use across a single campaign.',
    },
    {
      id: 'perpetual',
      name: 'Perpetual brand ambassador',
      price: '100',
      detail: 'Annually',
      description: 'Ongoing partnership.',
    },
  ],
  permittedUses: ['AI', 'Digital'],
  territories: ['United States only'],
  allowRetouching: false,
  approveFinalUse: false,
  images: Array.from({ length: 6 }, (_, index) => ({
    src: 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=',
    alt: `Avery likeness preview ${index + 1}`,
  })),
}

test('renders likeness metadata, purchase summary, and mock media', async () => {
  const screen = await render(LikenessPurchasePage, { purchase })

  await expect.element(screen.getByRole('heading', { name: 'Avery Stone' })).toBeVisible()
  await expect.element(screen.getByText('Actor and vocalist.')).toBeVisible()
  const purchaseSummary = screen.getByRole('region', { name: 'Purchase summary' })
  await expect.element(purchaseSummary.getByText('$10', { exact: true })).toBeVisible()
  await expect.element(screen.getByRole('button', { name: 'Add to Cart' })).toBeVisible()
  expect(document.body.textContent).not.toContain('Stage name:')
  expect(document.body.textContent).not.toContain('Show more')
  expect(document.body.textContent).not.toContain('Usage Terms')
  expect(document.querySelectorAll('[aria-label^="Open media image "]')).toHaveLength(10)
  expect(document.querySelectorAll('[aria-label^="Mock video "]')).toHaveLength(5)
  expect(document.querySelectorAll('[data-testid="media-play-icon"]')).toHaveLength(5)

  const singleUseLicense = screen.getByRole('radio', { name: /Single-use campaign/ })
  const perpetualLicense = screen.getByRole('radio', { name: /Perpetual brand ambassador/ })
  await expect.element(singleUseLicense).toBeChecked()
  await perpetualLicense.click()

  await expect.element(perpetualLicense).toBeChecked()
  await expect.element(purchaseSummary.getByText('$100', { exact: true })).toBeVisible()
})

test('opens and closes an enlarged image dialog', async () => {
  const screen = await render(LikenessPurchasePage, { purchase })

  await screen.getByRole('button', { name: 'Enlarge Avery likeness preview 2' }).click()
  await expect.element(screen.getByRole('dialog', { name: 'Enlarged likeness image' })).toBeVisible()

  await screen.getByRole('button', { name: 'Close image' }).click()
  expect(document.querySelector('[role="dialog"]')).toBeNull()

  await screen.getByRole('button', { name: 'Enlarge Avery likeness preview 1' }).click()
  await expect.element(screen.getByRole('dialog', { name: 'Enlarged likeness image' })).toBeVisible()

  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
  await tick()
  expect(document.querySelector('[role="dialog"]')).toBeNull()

  await screen.getByRole('button', { name: 'Open media image 1', exact: true }).click()
  await expect.element(screen.getByRole('dialog', { name: 'Enlarged likeness image' })).toBeVisible()
})
