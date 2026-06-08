export const LIKENESS_FILE_BUCKETS = ['headshots', 'bodyShots', 'voiceSamples', 'videoReels'] as const

export type MultipleFileKey = (typeof LIKENESS_FILE_BUCKETS)[number]
