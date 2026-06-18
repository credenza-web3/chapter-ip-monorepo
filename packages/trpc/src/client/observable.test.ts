import { describe, expect, it, vi } from 'vitest'
import { createObservable, shareObservable } from './observable'

describe('createObservable', () => {
  it('runs teardown when unsubscribed', () => {
    const teardown = vi.fn()
    const observable = createObservable<number, Error>(() => teardown)

    observable.subscribe({}).unsubscribe()

    expect(teardown).toHaveBeenCalledOnce()
  })
})

describe('shareObservable', () => {
  it('shares one source subscription across multiple observers', () => {
    const sourceSubscribe = vi.fn()
    const source = createObservable<number, Error>((observer) => {
      sourceSubscribe()
      observer.next?.(1)
      return undefined
    })
    const shared = shareObservable(source)
    const firstNext = vi.fn()
    const secondNext = vi.fn()

    shared.subscribe({ next: firstNext })
    shared.subscribe({ next: secondNext })

    expect(sourceSubscribe).toHaveBeenCalledOnce()
    expect(firstNext).toHaveBeenCalledWith(1)
    expect(secondNext).not.toHaveBeenCalled()
  })
})
