import { describe, expect, it } from 'vitest'
import { DEFAULT_IMAGE_URL } from '$lib/content/image'
import { getPreviewUrl } from '../location'
import { normalizeLocation } from './locationDetails'

const CONTRACT_ADDRESS = '0xcontent'

describe('location purchase mapper', () => {
  it('maps location metadata into the purchase view with one-time license only', () => {
    const purchase = normalizeLocation(
      {
        id: 'location-1',
        tokenId: '456',
        sub: 'sub-1',
        status: 'ACTIVE',
        contractAddress: CONTRACT_ADDRESS,
        metadata: {
          type: 'location',
          name: 'Citi Field',
          description: 'A baseball stadium in Queens, New York.',
          tags: ['Baseball', 'Queens'],
          file_name: 'citi-field.jpg',
          licensing: {
            licenseTypes: { 'single-use': true, perpetual: true },
            licensePrices: { 'single-use': '6000', perpetual: '12000' },
            agreedToFee: true,
          },
        },
      },
      CONTRACT_ADDRESS,
      'The City of New York',
    )

    expect(purchase).toMatchObject({
      id: 'location-1',
      contentTokenId: '456',
      name: 'Citi Field',
      description: 'A baseball stadium in Queens, New York.',
      tags: ['Baseball', 'Queens'],
      authorName: 'The City of New York',
      licenses: [
        {
          id: 'single-use',
          name: 'One-time license',
          price: '6000',
          description: 'Clears this location for a single project. One use, one payment — no ongoing rights.',
        },
      ],
      image: {
        src: getPreviewUrl(CONTRACT_ADDRESS, 'location-1', 'citi-field.jpg'),
        alt: 'Citi Field',
      },
    })
  })

  it('returns null for non-location content', () => {
    expect(
      normalizeLocation(
        {
          id: 'other',
          sub: 'sub-1',
          status: 'ACTIVE',
          contractAddress: CONTRACT_ADDRESS,
          metadata: { type: 'likeness' },
        },
        CONTRACT_ADDRESS,
      ),
    ).toBeNull()
  })

  it('uses the default image when file_name is missing', () => {
    const purchase = normalizeLocation(
      {
        id: 'location-2',
        sub: 'sub-1',
        status: 'ACTIVE',
        contractAddress: CONTRACT_ADDRESS,
        metadata: {
          type: 'location',
          name: 'Empty Preview',
          description: 'No preview file yet.',
          tags: [],
          file_name: '',
          licensing: {
            licenseTypes: { 'single-use': true },
            licensePrices: { 'single-use': '100' },
            agreedToFee: true,
          },
        },
      },
      CONTRACT_ADDRESS,
    )

    expect(purchase?.image.src).toBe(DEFAULT_IMAGE_URL)
  })
})
