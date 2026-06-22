function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Object.prototype.toString.call(value) === '[object Object]'
}

function sortPlainObjectKeys(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortPlainObjectKeys)
  }

  if (!isPlainObject(value)) {
    return value
  }

  return Object.fromEntries(
    Object.entries(value)
      .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
      .map(([key, entryValue]) => [key, sortPlainObjectKeys(entryValue)]),
  )
}

export function createStableCacheKey(path: string, input: unknown): string {
  return JSON.stringify([path, sortPlainObjectKeys(input)])
}
