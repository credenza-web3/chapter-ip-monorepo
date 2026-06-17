import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { render } from 'vitest-browser-svelte'
import { tick } from 'svelte'
import LikenessPurchasedItem from './LikenessPurchasedItem.svelte'
import type { LikenessDetails } from '@repo/content-types/likeness'
import type { PurchasedContentToken } from './types'

type FileLinkInput = {
  licenseTokenId?: string
  id?: string
  key?: string
}

const likeness: LikenessDetails = {
  id: 'content-1',
  contentTokenId: '101',
  name: 'Avery Stone',
  stageName: '',
  bio: 'Actor and vocalist.',
  attributes: [{ label: 'Eye color', value: 'Brown' }],
  affiliations: [{ union: 'SAG-AFTRA', memberId: '12345' }],
  licenses: [
    {
      id: 'single-use',
      name: 'Single-use campaign',
      price: '10',
      detail: 'campaign',
      description: 'One approved use across a single campaign.',
    },
  ],
  permittedUses: ['AI', 'Digital'],
  territories: ['United States'],
  allowRetouching: true,
  approveFinalUse: false,
  images: [
    {
      src: 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=',
      alt: 'Avery Stone preview',
    },
  ],
  media: [],
}

const purchase: PurchasedContentToken = {
  id: 'content-1',
  tokenId: '101',
  contentTokenId: 101,
  metadata: {
    type: 'likeness',
    profile: { fullLegalName: 'Avery Stone' },
  },
  files: [
    {
      id: 'file-1',
      filename: 'headshot_1',
      label: 'Headshot',
      mimetype: 'image/jpeg',
    },
  ],
  licenseType: '2',
  licenseTokenId: '44',
  isBlocked: false,
}

let queryInputs: FileLinkInput[]
let openMock: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  queryInputs = []
  openMock = vi.spyOn(window, 'open').mockImplementation(() => null)
})

afterEach(() => {
  vi.restoreAllMocks()
})

function getTrpcClient() {
  return {
    contents: {
      getContentFileLink: {
        query: async (input: FileLinkInput) => {
          queryInputs.push(input)
          return { url: 'https://r2.example/file' }
        },
      },
    },
  }
}

test('opens likeness license details in an accessible modal', async () => {
  const screen = await render(LikenessPurchasedItem, {
    purchase,
    likeness,
    trpcClient: getTrpcClient(),
  })

  await expect.element(screen.getByRole('heading', { name: 'Avery Stone' })).toBeVisible()
  await expect.element(screen.getByText('by Avery Stone')).toBeVisible()

  await screen.getByRole('button', { name: 'View License' }).click()

  const dialog = screen.getByRole('dialog', { name: 'Avery Stone' })
  await expect.element(dialog).toBeVisible()
  await expect.element(dialog.getByText('Actor and vocalist.')).toBeVisible()
  await expect.element(dialog.getByText('Single-use campaign')).toBeVisible()
  await expect.element(dialog.getByText(/\$10\s*\/\s*campaign/)).toBeVisible()
  await expect.element(dialog.getByText('AI, Digital')).toBeVisible()
  await expect.element(dialog.getByText('United States')).toBeVisible()
  await expect.element(dialog.getByText('SAG-AFTRA')).toBeVisible()
  await expect.element(dialog.getByText('Allowed')).toBeVisible()
  await expect.element(dialog.getByText('Not required')).toBeVisible()

  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
  await tick()
  expect(document.querySelector('[role="dialog"]')).toBeNull()
})

test('downloads through the existing content file link endpoint and blocks one-time licenses locally', async () => {
  const screen = await render(LikenessPurchasedItem, {
    purchase,
    likeness,
    trpcClient: getTrpcClient(),
  })

  await screen.getByRole('button', { name: 'Download' }).click()

  expect(queryInputs).toEqual([{ licenseTokenId: '44', id: 'file-1' }])
  expect(openMock).toHaveBeenCalledWith('https://r2.example/file', '_blank', 'noopener,noreferrer')
  await expect.element(screen.getByRole('button', { name: 'Already used' })).toBeDisabled()
})
