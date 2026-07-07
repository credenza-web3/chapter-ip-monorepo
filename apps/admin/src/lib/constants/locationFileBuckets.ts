export const LOCATION_FILE_BUCKETS = ['locations'] as const

export type LocationFileKey = (typeof LOCATION_FILE_BUCKETS)[number]

const LOCATION_FILE_PREFIXES: Record<LocationFileKey, string> = {
  locations: 'location',
}

export const createLocationFileNames = (
  bucket: LocationFileKey,
  count: number,
  existingNames: string[] = [],
): string[] => {
  const prefix = LOCATION_FILE_PREFIXES[bucket]
  const pattern = new RegExp(`^${prefix}_(\\d+)$`)
  let sequence = existingNames.reduce((max, name) => {
    const match = pattern.exec(name)
    return match ? Math.max(max, Number(match[1])) : max
  }, 0)

  return Array.from({ length: count }, () => {
    sequence += 1
    return `${prefix}_${sequence}`
  })
}
