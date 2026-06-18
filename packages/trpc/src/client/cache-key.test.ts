import { describe, expect, it } from 'vitest'
import { createStableCacheKey } from './cache-key'

describe('createStableCacheKey', () => {
  it('creates the same key for plain objects with different key order', () => {
    expect(createStableCacheKey('contents.findContent', { limit: '100', sort: 'createdAt' })).toBe(
      createStableCacheKey('contents.findContent', { sort: 'createdAt', limit: '100' }),
    )
  })

  it('keeps different paths isolated even when input matches', () => {
    const input = { id: 'content-1' }

    expect(createStableCacheKey('contents.findContent', input)).not.toBe(
      createStableCacheKey('contents.getContentById', input),
    )
  })

  it('handles undefined input as a stable key component', () => {
    expect(createStableCacheKey('contents.findContent', undefined)).toBe(
      createStableCacheKey('contents.findContent', undefined),
    )
  })
})
