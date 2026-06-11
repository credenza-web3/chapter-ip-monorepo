import { expect, test } from 'vitest'
import { render } from 'vitest-browser-svelte'
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
    { id: 'single-use', name: 'Single-use campaign', price: '10', detail: '' },
    { id: 'perpetual', name: 'Perpetual campaign', price: '100', detail: 'Ongoing' },
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

test('renders likeness metadata and updates the selected license', async () => {
  const screen = await render(LikenessPurchasePage, { purchase })

  await expect.element(screen.getByRole('heading', { name: 'Avery Stone' })).toBeVisible()
  await expect.element(screen.getByText('Actor and vocalist.')).toBeVisible()
  await expect.element(screen.getByText('United States only')).toBeVisible()
  await expect.element(screen.getByRole('complementary').getByText('$10', { exact: false })).toBeVisible()

  await screen.getByRole('radio', { name: /Perpetual campaign/ }).click()

  await expect.element(screen.getByRole('complementary').getByText('$100', { exact: false })).toBeVisible()
})

test('opens and closes an enlarged image dialog', async () => {
  const screen = await render(LikenessPurchasePage, { purchase })

  await screen.getByRole('button', { name: 'Enlarge Avery likeness preview 2' }).click()
  await expect.element(screen.getByRole('dialog', { name: 'Enlarged likeness image' })).toBeVisible()

  await screen.getByRole('button', { name: 'Close image' }).click()
  expect(document.querySelector('[role="dialog"]')).toBeNull()
})
