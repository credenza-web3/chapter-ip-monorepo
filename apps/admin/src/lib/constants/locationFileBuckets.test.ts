import { describe, expect, it } from 'vitest'

import { createLocationFileNames } from './locationFileBuckets'

describe('createLocationFileNames', () => {
  it('creates technical location file names', () => {
    expect(createLocationFileNames('locations', 2)).toEqual(['location_1', 'location_2'])
  })

  it('continues sequencing when existing names include extensions', () => {
    expect(createLocationFileNames('locations', 2, ['location_1.glb', 'location_3.obj'])).toEqual([
      'location_4',
      'location_5',
    ])
  })
})
