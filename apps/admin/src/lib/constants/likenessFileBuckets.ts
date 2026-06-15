export const LIKENESS_FILE_BUCKETS = ['headshots', 'bodyShots', 'voiceSamples', 'videoReels'] as const

export type MultipleFileKey = (typeof LIKENESS_FILE_BUCKETS)[number]

const LIKENESS_FILE_PREFIXES: Record<MultipleFileKey, string> = {
  headshots: 'headshot',
  bodyShots: 'bodyshot',
  voiceSamples: 'voice_sample',
  videoReels: 'video_reel',
}

export const createLikenessFileNames = (
  bucket: MultipleFileKey,
  count: number,
  existingNames: string[] = [],
): string[] => {
  const prefix = LIKENESS_FILE_PREFIXES[bucket]
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
