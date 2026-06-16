import { describe, expect, it } from 'vitest'
import { toLikenessPurchase } from './purchase'

describe('likeness purchase mapper', () => {
  it('maps profile and enabled licensing metadata into the purchase view', () => {
    const purchase = toLikenessPurchase(
      {
        id: 'likeness-1',
        tokenId: '123',
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
        files: [
          {
            id: 'headshot-file',
            filename: 'headshot_1',
            label: 'headshot_1',
            mimetype: 'image/jpeg',
          },
          {
            id: 'voice-file',
            filename: 'voice_sample_1',
            label: 'voice_sample_1',
            mimetype: 'audio/mpeg',
          },
          {
            id: 'video-file',
            filename: 'video_reel_1',
            label: 'video_reel_1',
            mimetype: 'video/mp4',
          },
        ],
      },
      '0xcontent',
    )

    expect(purchase).toMatchObject({
      id: 'likeness-1',
      contentTokenId: '123',
      name: 'Avery Stone',
      stageName: 'Avery',
      bio: 'Actor and vocalist.',
      affiliations: [{ union: 'SAG-AFTRA', memberId: '12345' }],
      licenses: [
        {
          id: 'single-use',
          name: 'Single-use campaign',
          price: '10',
          detail: '',
          description: expect.stringContaining('One approved use'),
        },
      ],
      permittedUses: ['AI', 'Digital'],
      territories: ['United States only'],
      allowRetouching: false,
      approveFinalUse: true,
    })
    expect(purchase?.attributes).toContainEqual({ label: 'Height', value: `5' 10" (178 cm)` })
    expect(purchase?.attributes).toContainEqual({ label: 'Weight', value: '165 lbs (74.8 kg)' })
    expect(purchase?.images).toEqual([
      {
        src: 'https://pub-1a5fde2f5a814d7bbcaca6562a705028.r2.dev/0xcontent/likeness-1/headshot_1',
        alt: 'Avery Stone headshot_1',
      },
    ])
    expect(purchase?.media).toEqual([
      {
        id: 'headshot-file',
        type: 'image',
        src: 'https://pub-1a5fde2f5a814d7bbcaca6562a705028.r2.dev/0xcontent/likeness-1/headshot_1',
        alt: 'Avery Stone headshot_1',
      },
      { id: 'voice-file', type: 'audio', label: 'voice_sample_1' },
      { id: 'video-file', type: 'video', label: 'video_reel_1' },
    ])
  })

  it('rejects content that is not a likeness', () => {
    expect(toLikenessPurchase({ id: 'other', metadata: { type: 'written-work' } }, '0xcontent')).toBeNull()
  })
})
