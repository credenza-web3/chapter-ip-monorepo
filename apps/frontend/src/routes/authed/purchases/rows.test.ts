import { describe, expect, it } from 'vitest'
import { getPreviewUrl } from '../location/location'
import { toPurchaseRow, toPurchaseRows } from './rows'
import type { PurchasedContentToken } from './types'

const CONTRACT_ADDRESS = '0xcontent'

const likenessPurchase: PurchasedContentToken = {
  id: 'likeness-1',
  tokenId: '101',
  contentTokenId: 101,
  sub: 'publisher-1',
  metadata: {
    type: 'likeness',
    profile: {
      fullLegalName: 'Avery Stone',
      stageName: 'Avery',
      bio: 'Actor and vocalist.',
    },
    licensing: {
      licenseTypes: { 'single-use': true },
      licensePrices: { 'single-use': '10' },
    },
    uploadsByBucket: { headshots: ['headshot_1'] },
  },
  files: [],
  licenseType: '2',
  licenseTokenId: '44',
  isBlocked: false,
}

const locationPurchase: PurchasedContentToken = {
  id: 'location-1',
  tokenId: '202',
  contentTokenId: 202,
  sub: 'publisher-2',
  tags: ['Baseball'],
  metadata: {
    type: 'location',
    name: 'Citi Field',
    description: 'A baseball stadium in Queens, New York.',
    file_name: 'citi-field.jpg',
    licensing: {
      licenseTypes: { 'single-use': true, perpetual: true },
      licensePrices: { 'single-use': '6000' },
      agreedToFee: true,
    },
  },
  files: [],
  licenseType: '2',
  licenseTokenId: '55',
  isBlocked: false,
}

describe('purchase rows', () => {
  it('maps likeness and location purchases into unified rows', () => {
    const rows = toPurchaseRows([likenessPurchase, locationPurchase], CONTRACT_ADDRESS, {
      'publisher-2': 'The City of New York',
    })

    expect(rows).toHaveLength(2)
    expect(rows[0]).toMatchObject({
      item: {
        type: 'likeness',
        categoryLabel: 'Likeness',
        name: 'Avery Stone',
        byline: 'by Avery',
      },
    })
    expect(rows[1]).toMatchObject({
      item: {
        type: 'location',
        categoryLabel: 'Location',
        name: 'Citi Field',
        byline: 'by The City of New York',
      },
    })
    expect(rows[1]?.item.image.src).toBe(getPreviewUrl(CONTRACT_ADDRESS, 'location-1', 'citi-field.jpg'))
  })

  it('ignores unsupported content types', () => {
    expect(
      toPurchaseRow(
        {
          ...likenessPurchase,
          metadata: { type: 'written-works' },
        },
        CONTRACT_ADDRESS,
      ),
    ).toEqual([])
  })
})
