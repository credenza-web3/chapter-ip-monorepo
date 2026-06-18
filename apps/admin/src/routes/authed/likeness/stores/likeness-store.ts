import { writable, derived } from 'svelte/store'
import type { AppRouter, TRPCClient } from '@repo/trpc/client'
import { LIKENESS_FILE_BUCKETS, type MultipleFileKey } from '$lib/constants/likenessFileBuckets'
import type {
  ContentFile,
  LikenessLicensingMetadata,
  LikenessMetadata,
  LikenessMetadataInput,
  LikenessProfileMetadata,
  YesNo,
} from '@repo/content-types/likeness'

export type ExistingFile = { id: string; name: string; url: string }
export type ExistingFilesByBucket = Record<MultipleFileKey, ExistingFile[]>

const emptyExistingFiles = (): ExistingFilesByBucket => ({
  headshots: [],
  bodyShots: [],
  voiceSamples: [],
  videoReels: [],
})

function resolveBucket(
  file: ContentFile,
  uploadsByBucket: LikenessMetadata['uploadsByBucket'] = {},
): MultipleFileKey | null {
  const bucket = LIKENESS_FILE_BUCKETS.find((bucket) =>
    uploadsByBucket[bucket]?.some((name) => name === file.filename || name === file.label),
  )
  if (bucket) return bucket

  return null
}

export async function loadExistingFiles(
  content: { id: string; files?: ContentFile[]; metadata?: LikenessMetadataInput },
  trpcClient: TRPCClient<AppRouter>,
): Promise<ExistingFilesByBucket> {
  const existingFiles = emptyExistingFiles()
  const uploadsByBucket = content.metadata?.uploadsByBucket ?? {}
  const contentFiles = content.files ?? []

  if (!content.id || !contentFiles.length) return existingFiles

  const { files: fileLinks } = await trpcClient.contents.getContentAllFilesLink.query({ contentId: content.id })
  const fileUrlsById = new Map(fileLinks.map((file) => [file.id, file.url]))

  for (const file of contentFiles) {
    const bucket = resolveBucket(file, uploadsByBucket)
    if (!bucket) continue

    const url = fileUrlsById.get(file.id)
    if (!url) {
      console.warn('No URL for file', file.id, file.filename)
      continue
    }

    existingFiles[bucket].push({ id: file.id, name: file.filename || file.label, url })
  }

  return existingFiles
}

interface LikenessState {
  files: {
    headshots: File[] // multiple
    bodyShots: File[] // multiple
    voiceSamples: File[] // multiple
    videoReels: File[] // multiple
  }
  profile: LikenessProfileMetadata
  licensing: LikenessLicensingMetadata
  confirmations: {
    rightsConfirmed: boolean
  }
  existingFiles: ExistingFilesByBucket
  isEditing: boolean
  ui: {
    loading: boolean
  }
}

function createLikenessStore() {
  const { subscribe, set, update } = writable<LikenessState>({
    files: {
      headshots: [],
      bodyShots: [],
      voiceSamples: [],
      videoReels: [],
    },
    profile: {
      fullLegalName: '',
      stageName: '',
      bio: '',
      attributes: {
        ethnicity: '',
        heightFt: '',
        heightIn: '',
        weight: '',
        eyeColor: '',
        hairColor: '',
      },
      affiliations: [{ union: '', memberId: '' }],
    },
    licensing: {
      isLifetime: false,
      isOneTime: false,
      lifetimePrice: 0,
      oneTimePrice: 0,
      licenseTypes: {
        'single-use': false,
        'time-limited': false,
        perpetual: false,
        'ai-digital': false,
        bulk: false,
      },
      licensePrices: {
        'single-use': '0',
        'time-limited': '0',
        perpetual: '0',
        'ai-digital': '0',
        bulk: '0',
      },
      licenseDropdowns: {
        'time-limited': '1 year',
        perpetual: 'Ongoing',
        bulk: 'Enterprise',
      },
      permittedUses: {},
      territories: ['United States only'],
      allowRetouching: null,
      approveFinalUse: null,
      agreedToFee: false,
    },
    confirmations: {
      rightsConfirmed: false,
    },
    existingFiles: emptyExistingFiles(),
    isEditing: false,
    ui: {
      loading: false,
    },
  })

  return {
    subscribe,
    set,
    appendMediaFiles(key: MultipleFileKey, newFiles: File[]) {
      update((s) => ({
        ...s,
        files: {
          ...s.files,
          [key]: [...(s.files[key] as File[]), ...newFiles],
        },
      }))
    },
    removeMediaFile(key: MultipleFileKey, index: number) {
      update((s) => ({
        ...s,
        files: {
          ...s.files,
          [key]: (s.files[key] as File[]).filter((_, i) => i !== index),
        },
      }))
    },
    removeExistingFile(key: MultipleFileKey, index: number) {
      update((s) => ({
        ...s,
        existingFiles: {
          ...s.existingFiles,
          [key]: s.existingFiles[key].filter((_, i) => i !== index),
        },
      }))
    },
    setFullLegalName: (value: string) => update((s) => ({ ...s, profile: { ...s.profile, fullLegalName: value } })),
    setStageName: (value: string) => update((s) => ({ ...s, profile: { ...s.profile, stageName: value } })),
    setBio: (value: string) => update((s) => ({ ...s, profile: { ...s.profile, bio: value } })),
    setAttribute: (key: keyof LikenessState['profile']['attributes'], value: string) =>
      update((s) => ({
        ...s,
        profile: {
          ...s.profile,
          attributes: { ...s.profile.attributes, [key]: value },
        },
      })),
    addAffiliation: () =>
      update((s) => ({
        ...s,
        profile: { ...s.profile, affiliations: [...s.profile.affiliations, { union: '', memberId: '' }] },
      })),
    removeAffiliation: (index: number) =>
      update((s) => ({
        ...s,
        profile: {
          ...s.profile,
          affiliations: s.profile.affiliations.filter((_, i) => i !== index),
        },
      })),
    updateAffiliation: (index: number, key: 'union' | 'memberId', value: string) =>
      update((s) => ({
        ...s,
        profile: {
          ...s.profile,
          affiliations: s.profile.affiliations.map((a, i) => (i === index ? { ...a, [key]: value } : a)),
        },
      })),
    setLicenseTypeEnabled: (id: string, value: boolean) =>
      update((s) => {
        const nextLicensing = {
          ...s.licensing,
          licenseTypes: { ...s.licensing.licenseTypes, [id]: value },
        }
        if (id === 'single-use') {
          nextLicensing.isOneTime = value
          nextLicensing.oneTimePrice = value ? Number(nextLicensing.licensePrices[id] || 0) : 0
        }
        if (id === 'perpetual') {
          nextLicensing.isLifetime = value
          nextLicensing.lifetimePrice = value ? Number(nextLicensing.licensePrices[id] || 0) : 0
        }
        return { ...s, licensing: nextLicensing }
      }),
    setLicenseTypePrice: (id: string, value: string) =>
      update((s) => {
        const safeValue = value.replace(/[^\d.]/g, '')
        const nextLicensing = {
          ...s.licensing,
          licensePrices: { ...s.licensing.licensePrices, [id]: safeValue },
        }
        if (id === 'single-use') nextLicensing.oneTimePrice = Number(safeValue || 0)
        if (id === 'perpetual') nextLicensing.lifetimePrice = Number(safeValue || 0)
        return { ...s, licensing: nextLicensing }
      }),
    setLicenseTypeDropdown: (id: string, value: string) =>
      update((s) => ({
        ...s,
        licensing: {
          ...s.licensing,
          licenseDropdowns: { ...s.licensing.licenseDropdowns, [id]: value },
        },
      })),
    setPermittedUse: (id: string, value: boolean) =>
      update((s) => ({
        ...s,
        licensing: { ...s.licensing, permittedUses: { ...s.licensing.permittedUses, [id]: value } },
      })),
    setAllPermittedUses: (ids: string[], value: boolean) =>
      update((s) => ({
        ...s,
        licensing: { ...s.licensing, permittedUses: Object.fromEntries(ids.map((id) => [id, value])) },
      })),
    setTerritories: (territories: string[]) => update((s) => ({ ...s, licensing: { ...s.licensing, territories } })),
    setAllowRetouching: (value: YesNo) =>
      update((s) => ({ ...s, licensing: { ...s.licensing, allowRetouching: value } })),
    setApproveFinalUse: (value: YesNo) =>
      update((s) => ({ ...s, licensing: { ...s.licensing, approveFinalUse: value } })),
    setAgreedToFee: (value: boolean) => update((s) => ({ ...s, licensing: { ...s.licensing, agreedToFee: value } })),
    setRightsConfirmed: (value: boolean) =>
      update((s) => ({ ...s, confirmations: { ...s.confirmations, rightsConfirmed: value } })),
    setLoading: (loading: boolean) => update((s) => ({ ...s, ui: { ...s.ui, loading } })),
    hydrateFromContent(
      content: { metadata?: LikenessMetadataInput },
      existingFiles: ExistingFilesByBucket = emptyExistingFiles(),
    ) {
      const metadata = content.metadata ?? {}
      const profile = (metadata.profile ?? {}) as Partial<LikenessProfileMetadata>
      const licensing = (metadata.licensing ?? {}) as Partial<LikenessLicensingMetadata>

      update((s) => ({
        ...s,
        profile: {
          ...s.profile,
          ...profile,
          attributes: { ...s.profile.attributes, ...(profile.attributes ?? {}) },
          affiliations: profile.affiliations?.length ? profile.affiliations : s.profile.affiliations,
        },
        licensing: {
          ...s.licensing,
          ...licensing,
          licenseTypes: { ...s.licensing.licenseTypes, ...(licensing.licenseTypes ?? {}) },
          licensePrices: { ...s.licensing.licensePrices, ...(licensing.licensePrices ?? {}) },
          licenseDropdowns: { ...s.licensing.licenseDropdowns, ...(licensing.licenseDropdowns ?? {}) },
          permittedUses: { ...s.licensing.permittedUses, ...(licensing.permittedUses ?? {}) },
        },
        confirmations: { rightsConfirmed: true },
        existingFiles,
        isEditing: Object.values(existingFiles).some((files) => files.length > 0),
      }))
    },
    reset: () =>
      set({
        files: {
          headshots: [],
          bodyShots: [],
          voiceSamples: [],
          videoReels: [],
        },
        profile: {
          fullLegalName: '',
          stageName: '',
          bio: '',
          attributes: {
            ethnicity: '',
            heightFt: '',
            heightIn: '',
            weight: '',
            eyeColor: '',
            hairColor: '',
          },
          affiliations: [{ union: '', memberId: '' }],
        },
        licensing: {
          isLifetime: false,
          isOneTime: false,
          lifetimePrice: 0,
          oneTimePrice: 0,
          licenseTypes: {
            'single-use': true,
            'time-limited': false,
            perpetual: false,
            'ai-digital': false,
            bulk: false,
          },
          licensePrices: {
            'single-use': '0',
            'time-limited': '0',
            perpetual: '0',
            'ai-digital': '0',
            bulk: '0',
          },
          licenseDropdowns: {
            'time-limited': '1 year',
            perpetual: 'Ongoing',
            bulk: 'Enterprise',
          },
          permittedUses: {},
          territories: ['United States only'],
          allowRetouching: null,
          approveFinalUse: null,
          agreedToFee: false,
        },
        confirmations: { rightsConfirmed: false },
        existingFiles: emptyExistingFiles(),
        isEditing: false,
        ui: { loading: false },
      }),
  }
}

export const likenessStore = createLikenessStore()

export const isFormValid = derived(likenessStore, ($s) => {
  const enabledLicenseTypes = Object.entries($s.licensing.licenseTypes).filter(([, enabled]) => enabled)
  const hasLicenseType = enabledLicenseTypes.length > 0
  const hasHeadshots = $s.files.headshots.length > 0 || $s.existingFiles.headshots.length > 0

  if ($s.isEditing) {
    return hasHeadshots && hasLicenseType
  }

  const hasValidLicensePrice = enabledLicenseTypes.some(([id]) => Number($s.licensing.licensePrices[id] || 0) > 0)
  const hasPermittedUse = Object.values($s.licensing.permittedUses).some(Boolean)

  return (
    hasLicenseType &&
    hasValidLicensePrice &&
    hasPermittedUse &&
    $s.licensing.territories.length > 0 &&
    $s.licensing.allowRetouching !== null &&
    $s.licensing.approveFinalUse !== null &&
    $s.licensing.agreedToFee
  )
})
