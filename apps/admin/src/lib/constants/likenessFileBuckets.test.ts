import { describe, expect, it } from 'vitest'

import { createLikenessFileNames } from './likenessFileBuckets'

describe('createLikenessFileNames', () => {
  it.each([
    ['headshots', ['headshot_1', 'headshot_2']],
    ['bodyShots', ['bodyshot_1', 'bodyshot_2']],
    ['voiceSamples', ['voice_sample_1', 'voice_sample_2']],
    ['videoReels', ['video_reel_1', 'video_reel_2']],
  ] as const)('creates names for %s', (bucket, expected) => {
    expect(createLikenessFileNames(bucket, 2)).toEqual(expected)
  })

  it('continues after the highest existing technical name', () => {
    expect(createLikenessFileNames('headshots', 2, ['original.jpg', 'headshot_2'])).toEqual([
      'headshot_3',
      'headshot_4',
    ])
  })

  it('continues sequencing when existing names include extensions', () => {
    expect(createLikenessFileNames('headshots', 1, ['headshot_1.jpg', 'headshot_2.jpg'])).toEqual(['headshot_3'])
  })
})
