import { beforeEach, expect, test, vi } from 'vitest'
import { render } from 'vitest-browser-svelte'
import { tick } from 'svelte'
import LikenessPurchasePage from './LikenessPurchasePage.svelte'
import type { LikenessPurchase } from './types'

const canPurchaseLicenseMock = vi.hoisted(() => vi.fn(() => true))
const purchaseLicenseMock = vi.hoisted(() => vi.fn())

vi.mock('./purchaseLicense', () => ({
  canPurchaseLicense: canPurchaseLicenseMock,
  purchaseLicense: purchaseLicenseMock,
}))

const likenessDetails: LikenessPurchase = {
  id: 'likeness-1',
  contentTokenId: '123',
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
  permittedUses: ['AI Training', 'Digital'],
  territories: ['United States only'],
  allowRetouching: false,
  approveFinalUse: false,
  images: Array.from({ length: 6 }, (_, index) => ({
    src: 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=',
    alt: `Avery likeness preview ${index + 1}`,
  })),
  media: [
    {
      id: 'image-1',
      type: 'image',
      src: 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=',
      alt: 'Avery likeness preview 1',
    },
    { id: 'video-1', type: 'video', label: 'video_reel_1' },
    { id: 'audio-1', type: 'audio', label: 'voice_sample_1' },
  ],
}

beforeEach(() => {
  canPurchaseLicenseMock.mockReturnValue(true)
  purchaseLicenseMock.mockResolvedValue(undefined)
  vi.clearAllMocks()
})

test('renders likeness metadata, purchase summary, and real media entries', async () => {
  const screen = await render(LikenessPurchasePage, { likenessDetails })

  await expect.element(screen.getByRole('heading', { name: 'Avery Stone' })).toBeVisible()
  await expect.element(screen.getByText('Actor and vocalist.')).toBeVisible()
  const purchaseSummary = screen.getByRole('region', { name: 'Purchase summary' })
  await expect.element(purchaseSummary.getByText('$10', { exact: true })).toBeVisible()
  const buyButton = screen.getByRole('button', { name: 'Buy License' })
  await expect.element(buyButton).toBeVisible()
  await expect.element(buyButton).toBeEnabled()
  expect(document.body.textContent).not.toContain('Stage name:')
  expect(document.body.textContent).not.toContain('Show more')
  expect(document.body.textContent).not.toContain('Usage Terms')
  expect(document.querySelectorAll('[aria-label^="Open Avery likeness preview"]')).toHaveLength(1)
  await expect.element(screen.getByText('Video', { exact: true })).toBeVisible()
  await expect.element(screen.getByText('Audio', { exact: true })).toBeVisible()
  await expect.element(screen.getByText('video_reel_1')).toBeVisible()
  await expect.element(screen.getByText('voice_sample_1')).toBeVisible()

  const singleUseLicense = screen.getByRole('radio', { name: /Single-use campaign/ })
  const perpetualLicense = screen.getByRole('radio', { name: /Perpetual brand ambassador/ })
  await expect.element(singleUseLicense).toBeChecked()
  await buyButton.click()

  expect(purchaseLicenseMock).toHaveBeenCalledWith({ purchase: likenessDetails, license: likenessDetails.licenses[0] })

  await perpetualLicense.click()

  await expect.element(perpetualLicense).toBeChecked()
  await expect.element(purchaseSummary.getByText('$100', { exact: true })).toBeVisible()
  await buyButton.click()

  expect(purchaseLicenseMock).toHaveBeenLastCalledWith({
    purchase: likenessDetails,
    license: likenessDetails.licenses[1],
  })
  expect(purchaseLicenseMock).toHaveBeenCalledTimes(2)
})

test('opens and closes an enlarged image dialog', async () => {
  const screen = await render(LikenessPurchasePage, { likenessDetails })

  await screen.getByRole('button', { name: 'Enlarge Avery likeness preview 2' }).click()
  await expect.element(screen.getByRole('dialog', { name: 'Enlarged likeness image' })).toBeVisible()

  await screen.getByRole('button', { name: 'Close image' }).click()
  expect(document.querySelector('[role="dialog"]')).toBeNull()

  await screen.getByRole('button', { name: 'Enlarge Avery likeness preview 1' }).click()
  await expect.element(screen.getByRole('dialog', { name: 'Enlarged likeness image' })).toBeVisible()

  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
  await tick()
  expect(document.querySelector('[role="dialog"]')).toBeNull()

  await screen.getByRole('button', { name: 'Open Avery likeness preview 1', exact: true }).click()
  await expect.element(screen.getByRole('dialog', { name: 'Enlarged likeness image' })).toBeVisible()
})
