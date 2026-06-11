import { describe, expect, it } from 'vitest'
import { toLikenessPurchase } from './purchase'

describe('likeness purchase mapper', () => {
  it('maps profile and enabled licensing metadata into the purchase view', () => {
    const purchase = toLikenessPurchase({
      id: 'likeness-1',
      metadata: {
        type: 'likeness',
        profile: {
          fullLegalName: 'Avery Stone',
          stageName: 'Avery',
          bio: 'Actor and vocalist.',
          attributes: {
            ethnicity: 'Mixed',
            heightFt: '5',
            heightIn: '10',
            weight: '165',
            eyeColor: 'Brown',
            hairColor: 'Black',
          },
          affiliations: [
            { union: 'SAG-AFTRA', memberId: '12345' },
            { union: '', memberId: '' },
          ],
        },
        licensing: {
          licenseTypes: { 'single-use': true, perpetual: false },
          licensePrices: { 'single-use': '10' },
          licenseDropdowns: {},
          permittedUses: { ai: true, commercial: false, digital: true },
          territories: ['United States only'],
          allowRetouching: 'no',
          approveFinalUse: 'yes',
        },
      },
    })

    expect(purchase).toMatchObject({
      id: 'likeness-1',
      name: 'Avery Stone',
      stageName: 'Avery',
      bio: 'Actor and vocalist.',
      affiliations: [{ union: 'SAG-AFTRA', memberId: '12345' }],
      licenses: [{ id: 'single-use', name: 'Single-use campaign', price: '10', detail: '' }],
      permittedUses: ['AI', 'Digital'],
      territories: ['United States only'],
      allowRetouching: false,
      approveFinalUse: true,
    })
    expect(purchase?.attributes).toContainEqual({ label: 'Height', value: `5' 10" (178 cm)` })
    expect(purchase?.attributes).toContainEqual({ label: 'Weight', value: '165 lbs (74.8 kg)' })
    expect(purchase?.images).toHaveLength(6)
  })

  it('rejects content that is not a likeness', () => {
    expect(toLikenessPurchase({ id: 'other', metadata: { type: 'written-work' } })).toBeNull()
  })
})
