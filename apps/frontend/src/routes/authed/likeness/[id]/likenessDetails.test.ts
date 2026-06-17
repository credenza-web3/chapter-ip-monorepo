import { describe, expect, it } from 'vitest'
import { DEFAULT_IMAGE_URL } from '../likeness'
import { normalizeLikeness } from './likenessDetails'

describe('likeness purchase mapper', () => {
  it('maps profile and enabled licensing metadata into the purchase view', () => {
    const purchase = normalizeLikeness(
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
    expect(normalizeLikeness({ id: 'other', metadata: { type: 'written-work' } }, '0xcontent')).toBeNull()
  })

  it('uses defaults for partial likeness metadata and falls back when no image media exists', () => {
    const purchase = normalizeLikeness(
      {
        id: 'partial-likeness',
        tokenId: ' 456 ',
        metadata: {
          type: 'likeness',
          profile: {
            fullLegalName: '   ',
            affiliations: [{ union: '  ', memberId: '' }],
          },
          licensing: {
            licenseTypes: { 'single-use': false, custom: true },
            licensePrices: { custom: ' 25 ' },
            permittedUses: { ai: false },
            territories: ['  ', ' Worldwide '],
          },
        },
        files: [
          {
            id: ' file-id ',
            filename: ' ',
            label: ' contract.pdf ',
            mimetype: 'application/pdf',
          },
        ],
      },
      '0xcontent',
    )

    expect(purchase).toMatchObject({
      id: 'partial-likeness',
      contentTokenId: '456',
      name: 'Unnamed likeness',
      stageName: '',
      bio: '',
      attributes: [],
      affiliations: [],
      licenses: [
        {
          id: 'custom',
          name: 'Custom',
          price: '25',
          detail: '',
          description: '',
        },
      ],
      permittedUses: [],
      territories: ['Worldwide'],
      allowRetouching: false,
      approveFinalUse: false,
      images: [{ src: DEFAULT_IMAGE_URL, alt: 'Unnamed likeness default likeness preview' }],
      media: [{ id: 'file-id', type: 'file', label: 'contract.pdf' }],
    })
  })

  it('uses empty purchase fields when likeness metadata sections are missing', () => {
    const purchase = normalizeLikeness(
      {
        id: 'empty-likeness',
        metadata: { type: 'likeness' },
      },
      '0xcontent',
    )

    expect(purchase).toMatchObject({
      id: 'empty-likeness',
      contentTokenId: '',
      name: 'Unnamed likeness',
      stageName: '',
      bio: '',
      attributes: [],
      affiliations: [],
      licenses: [],
      permittedUses: [],
      territories: [],
      allowRetouching: false,
      approveFinalUse: false,
      images: [{ src: DEFAULT_IMAGE_URL, alt: 'Unnamed likeness default likeness preview' }],
      media: [],
    })
  })
})
