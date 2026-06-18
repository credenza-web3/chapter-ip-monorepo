import type { OperationResultEnvelope, TRPCClientError, TRPCLink } from '@trpc/client'
import type { Observable } from '@trpc/server/observable'
import type { AppRouter } from '../server/server'
import { createStableCacheKey } from './cache-key'
import { createObservable, shareObservable } from './observable'

const CONTENT_QUERY_CACHE_TTL_MS = 60_000
const CACHED_CONTENT_QUERY_PATHS = new Set(['contents.findContent', 'contents.getContentById'])
const CONTENT_QUERY_CACHE_INVALIDATING_MUTATIONS = new Set([
  'contents.registerContent',
  'contents.updateContentMetadata',
  'contents.registerContentFile',
  'contents.removeContentFile',
])

type QueryCacheResult = OperationResultEnvelope<unknown, TRPCClientError<AppRouter>>
type QueryCacheObservable = Observable<QueryCacheResult, TRPCClientError<AppRouter>>
type QueryCacheEntry =
  | {
      expiresAt: number
      status: 'pending'
      observable: QueryCacheObservable
    }
  | {
      expiresAt: number
      status: 'resolved'
      value: QueryCacheResult
    }

const contentQueryCache = new Map<string, QueryCacheEntry>()

function invalidateContentQueryCache(): void {
  contentQueryCache.clear()
}

function pruneExpiredContentQueryCache(now = Date.now()): void {
  for (const [key, entry] of contentQueryCache.entries()) {
    if (entry.expiresAt <= now) {
      contentQueryCache.delete(key)
    }
  }
}

export function contentQueryCacheLink(): TRPCLink<AppRouter> {
  return () =>
    ({ op, next }) => {
      if (op.type === 'mutation' && CONTENT_QUERY_CACHE_INVALIDATING_MUTATIONS.has(op.path)) {
        return createObservable((observer) =>
          next(op).subscribe({
            next(value) {
              invalidateContentQueryCache()
              observer.next?.(value)
            },
            error(error) {
              observer.error?.(error)
            },
            complete() {
              observer.complete?.()
            },
          }),
        )
      }

      if (op.type !== 'query' || !CACHED_CONTENT_QUERY_PATHS.has(op.path)) {
        return next(op)
      }

      const now = Date.now()
      pruneExpiredContentQueryCache(now)

      const cacheKey = createStableCacheKey(op.path, op.input)
      const cached = contentQueryCache.get(cacheKey)

      if (cached && cached.expiresAt > now) {
        if (cached.status === 'pending') {
          return cached.observable
        }

        return createObservable((observer) => {
          observer.next?.(cached.value)
          observer.complete?.()
        })
      }

      const observableResult = shareObservable(
        createObservable<QueryCacheResult, TRPCClientError<AppRouter>>((observer) =>
          next(op).subscribe({
            next(value) {
              contentQueryCache.set(cacheKey, {
                expiresAt: Date.now() + CONTENT_QUERY_CACHE_TTL_MS,
                status: 'resolved',
                value,
              })
              observer.next?.(value)
            },
            error(error) {
              contentQueryCache.delete(cacheKey)
              observer.error?.(error)
            },
            complete() {
              observer.complete?.()
            },
          }),
        ),
      )

      contentQueryCache.set(cacheKey, {
        expiresAt: now + CONTENT_QUERY_CACHE_TTL_MS,
        status: 'pending',
        observable: observableResult,
      })

      return observableResult
    }
}
