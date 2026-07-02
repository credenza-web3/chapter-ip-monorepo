import { describe, expect, it } from 'vitest'
import { normalizeLikeness } from './likenessDetails'

describe('likeness purchase mapper', () => {
  it('maps profile and enabled licensing metadata into the purchase view', () => {
    const purchase = normalizeLikeness(
      {
        id: 'likeness-1',
        tokenId: '123',
        sub: 'sub-1',
        status: 'active',
        contractAddress: '0xcontent',
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
              weight: 165,
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
            permittedUses: { ai: true, commercial: false, digital: true },
            territories: ['United States only'],
            allowRetouching: 'no',
            approveFinalUse: 'yes',
          },
          uploadsByBucket: {
            headshots: ['headshot_1'],
            bodyShots: ['bodyshot_1'],
            voiceSamples: ['voice_sample_1'],
            videoReels: ['video_reel_1'],
          },
        },
        files: [
          {
            id: 'ignored-headshot-file',
            filename: 'different_headshot',
            label: 'different_headshot',
            mimetype: 'image/jpeg',
          },
          {
            id: 'ignored-voice-file',
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
      permittedUses: ['AI Training', 'Digital'],
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
      {
        src: 'https://pub-1a5fde2f5a814d7bbcaca6562a705028.r2.dev/0xcontent/likeness-1/bodyshot_1',
        alt: 'Avery Stone bodyshot_1',
      },
    ])
    expect(purchase?.media).toEqual([
      {
        id: 'headshot_1',
        type: 'image',
        src: 'https://pub-1a5fde2f5a814d7bbcaca6562a705028.r2.dev/0xcontent/likeness-1/headshot_1',
        alt: 'Avery Stone headshot_1',
      },
      {
        id: 'bodyshot_1',
        type: 'image',
        src: 'https://pub-1a5fde2f5a814d7bbcaca6562a705028.r2.dev/0xcontent/likeness-1/bodyshot_1',
        alt: 'Avery Stone bodyshot_1',
      },
      { id: 'voice_sample_1', type: 'audio', label: 'voice_sample_1' },
      { id: 'video_reel_1', type: 'video', label: 'video_reel_1' },
    ])
  })

  it('rejects content that is not a likeness', () => {
    expect(
      normalizeLikeness(
        {
          id: 'other',
          metadata: { type: 'written-work' },
          sub: 'sub-1',
          status: 'active',
          contractAddress: '0xcontent',
        },
        '0xcontent',
      ),
    ).toBeNull()
  })

  it('uses defaults for partial likeness metadata and falls back when no image media exists', () => {
    const purchase = normalizeLikeness(
      {
        id: 'partial-likeness',
        tokenId: ' 456 ',
        sub: 'sub-1',
        status: 'active',
        contractAddress: '0xcontent',
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
      images: [
        {
          src: 'https://pub-1a5fde2f5a814d7bbcaca6562a705028.r2.dev/0xcontent/partial-likeness/headshot_1',
          alt: 'Unnamed likeness headshot_1',
        },
      ],
      media: [
        {
          id: 'headshot_1',
          type: 'image',
          src: 'https://pub-1a5fde2f5a814d7bbcaca6562a705028.r2.dev/0xcontent/partial-likeness/headshot_1',
          alt: 'Unnamed likeness headshot_1',
        },
      ],
    })
  })

  it('uses empty purchase fields when likeness metadata sections are missing', () => {
    const purchase = normalizeLikeness(
      {
        id: 'empty-likeness',
        sub: 'sub-1',
        status: 'active',
        contractAddress: '0xcontent',
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
      images: [
        {
          src: 'https://pub-1a5fde2f5a814d7bbcaca6562a705028.r2.dev/0xcontent/empty-likeness/headshot_1',
          alt: 'Unnamed likeness headshot_1',
        },
      ],
      media: [
        {
          id: 'headshot_1',
          type: 'image',
          src: 'https://pub-1a5fde2f5a814d7bbcaca6562a705028.r2.dev/0xcontent/empty-likeness/headshot_1',
          alt: 'Unnamed likeness headshot_1',
        },
      ],
    })
  })
})
