import { describe, expect, it } from 'vitest'
import { DEFAULT_IMAGE_URL, useDefaultImage } from './image'

describe('content image helpers', () => {
  it('sets the default image when loading fails', () => {
    const image = { src: 'https://example.test/missing.jpg' } as HTMLImageElement

    useDefaultImage({ currentTarget: image } as unknown as Event)

    expect(image.src).toBe(DEFAULT_IMAGE_URL)
  })

  it('does not loop when the default image also fails', () => {
    const image = { src: DEFAULT_IMAGE_URL } as HTMLImageElement

    useDefaultImage({ currentTarget: image } as unknown as Event)

    expect(image.src).toBe(DEFAULT_IMAGE_URL)
  })
})
