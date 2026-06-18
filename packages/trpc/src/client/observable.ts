import type { Observable, Observer, TeardownLogic, Unsubscribable } from '@trpc/server/observable'

export function createObservable<TValue, TError>(
  subscribe: (observer: Partial<Observer<TValue, TError>>) => TeardownLogic,
): Observable<TValue, TError> {
  const self = {
    subscribe(observer: Partial<Observer<TValue, TError>>): Unsubscribable {
      const teardown = subscribe(observer)

      return {
        unsubscribe() {
          if (typeof teardown === 'function') {
            teardown()
            return
          }

          teardown?.unsubscribe()
        },
      }
    },
    pipe() {
      return self
    },
  }

  return self as Observable<TValue, TError>
}

export function shareObservable<TValue, TError>(source: Observable<TValue, TError>): Observable<TValue, TError> {
  let subscription: Unsubscribable | null = null
  const observers: Array<Partial<Observer<TValue, TError>>> = []

  function startIfNeeded(): void {
    if (subscription) {
      return
    }

    subscription = source.subscribe({
      next(value) {
        for (const observer of observers) {
          observer.next?.(value)
        }
      },
      error(error) {
        for (const observer of observers) {
          observer.error?.(error)
        }
      },
      complete() {
        for (const observer of observers) {
          observer.complete?.()
        }
      },
    })
  }

  return createObservable((observer) => {
    observers.push(observer)
    startIfNeeded()

    return () => {
      const observerIndex = observers.findIndex((candidate) => candidate === observer)
      if (observerIndex > -1) {
        observers.splice(observerIndex, 1)
      }

      if (observers.length === 0 && subscription) {
        const activeSubscription = subscription
        subscription = null
        activeSubscription.unsubscribe()
      }
    }
  })
}
