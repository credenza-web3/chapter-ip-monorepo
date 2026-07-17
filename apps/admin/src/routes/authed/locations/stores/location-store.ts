import { writable, derived } from 'svelte/store'
import type { AppRouter, TRPCClient } from '@repo/trpc/client'
import { type LocationFileKey } from '$lib/constants/locationFileBuckets'
import type { LocationAddress, LocationLicensingMetadata, LocationMetadataInput } from '@repo/content-types/location'
import { r2BaseConfig, VIDEO_EXTENSIONS } from '@repo/fe-services'

type ExistingFile = { id: string; name: string; url: string; previewUrl?: string }
type ExistingFilesByBucket = Record<LocationFileKey, ExistingFile[]>

const emptyExistingFiles = (): ExistingFilesByBucket => ({
  locations: [],
})

export async function loadExistingFiles(
  content: { id: string; contractAddress: string; metadata?: LocationMetadataInput },
  trpcClient: TRPCClient<AppRouter>,
): Promise<ExistingFilesByBucket> {
  const existingFiles = emptyExistingFiles()

  if (!content.id) return existingFiles

  const { files } = await trpcClient.contents.getContentAllFilesLink.query({ contentId: content.id })

  const allowedNames = new Set(
    (content.metadata?.file_names ?? [content.metadata?.file_name])
      .filter((n): n is string => !!n)
      .map((n) => n.trim()),
  )

  for (const file of files ?? []) {
    if (allowedNames.has(file.label)) {
      const isVideo = file.mimetype.startsWith('video/') || VIDEO_EXTENSIONS.some((ext) => file.label.endsWith(ext))
      const previewUrl = isVideo
        ? `${r2BaseConfig.previewUrl}/${content.contractAddress}/${content.id}/${file.label}`
        : undefined
      existingFiles.locations.push({ id: file.id, name: file.label, url: file.url, previewUrl })
    }
  }

  return existingFiles
}

interface LocationState {
  files: {
    locations: File[]
  }
  name: string
  description: string
  tags: string[]
  address: LocationAddress
  licensing: LocationLicensingMetadata
  confirmations: {
    rightsConfirmed: boolean
  }
  existingFiles: ExistingFilesByBucket
  isEditing: boolean
  ui: {
    loading: boolean
  }
}

function createLocationStore() {
  const { subscribe, set, update } = writable<LocationState>({
    files: {
      locations: [],
    },
    name: '',
    description: '',
    tags: [],
    address: { street: '', apt: '', city: '', state: '', zip: '' },
    licensing: {
      licenseTypes: {
        'single-use': true,
      },
      licensePrices: {
        'single-use': '',
      },
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
    appendMediaFiles(key: LocationFileKey, newFiles: File[]) {
      update((s) => ({
        ...s,
        files: {
          ...s.files,
          [key]: [...(s.files[key] as File[]), ...newFiles],
        },
      }))
    },
    removeMediaFile(key: LocationFileKey, index: number) {
      update((s) => ({
        ...s,
        files: {
          ...s.files,
          [key]: (s.files[key] as File[]).filter((_, i) => i !== index),
        },
      }))
    },
    removeExistingFile(key: LocationFileKey, index: number) {
      update((s) => ({
        ...s,
        existingFiles: {
          ...s.existingFiles,
          [key]: s.existingFiles[key].filter((_, i) => i !== index),
        },
      }))
    },
    setTags: (value: string[]) => update((s) => ({ ...s, tags: value })),
    setAddress: (value: LocationAddress) => update((s) => ({ ...s, address: value })),
    setLicenseTypeEnabled: (id: string, value: boolean) =>
      update((s) => {
        const nextLicensing = {
          ...s.licensing,
          licenseTypes: { ...s.licensing.licenseTypes, [id]: value },
          licensePrices: { ...s.licensing.licensePrices, [id]: value ? s.licensing.licensePrices[id] || '' : '' },
        }
        return { ...s, licensing: nextLicensing }
      }),
    setLicenseTypePrice: (id: string, value: string) =>
      update((s) => {
        const safeValue = value.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1')
        const nextLicensing = {
          ...s.licensing,
          licensePrices: { ...s.licensing.licensePrices, [id]: safeValue },
        }
        return { ...s, licensing: nextLicensing }
      }),
    setAgreedToFee: (value: boolean) => update((s) => ({ ...s, licensing: { ...s.licensing, agreedToFee: value } })),
    setRightsConfirmed: (value: boolean) =>
      update((s) => ({ ...s, confirmations: { ...s.confirmations, rightsConfirmed: value } })),
    setLoading: (loading: boolean) => update((s) => ({ ...s, ui: { ...s.ui, loading } })),
    hydrateFromContent(
      content: { metadata?: LocationMetadataInput; tags?: string[] },
      existingFiles: ExistingFilesByBucket = emptyExistingFiles(),
    ) {
      const metadata = (content.metadata ?? {}) as Record<string, unknown>
      const name = (metadata.name as string) ?? ''
      const description = (metadata.description as string) ?? ''
      const address = (metadata.address as LocationAddress) ?? { street: '', apt: '', city: '', state: '', zip: '' }
      const tags = content.tags ?? (metadata.tags as string[] | undefined) ?? []
      const licensing = (metadata.licensing ?? {}) as Partial<LocationLicensingMetadata>

      update((s) => ({
        ...s,
        name: name ?? '',
        description: description ?? '',
        tags: tags ?? [],
        address: {
          street: address?.street ?? '',
          apt: address?.apt ?? '',
          city: address?.city ?? '',
          state: address?.state ?? '',
          zip: address?.zip ?? '',
        },
        licensing: {
          ...s.licensing,
          ...licensing,
          licenseTypes: { ...s.licensing.licenseTypes, ...(licensing?.licenseTypes ?? {}) },
          licensePrices: { ...s.licensing.licensePrices, ...(licensing?.licensePrices ?? {}) },
        },
        confirmations: { rightsConfirmed: true },
        existingFiles,
        isEditing: Object.values(existingFiles).some((files) => files.length > 0),
      }))
    },
    reset: () =>
      set({
        files: {
          locations: [],
        },
        name: '',
        description: '',
        tags: [],
        address: { street: '', apt: '', city: '', state: '', zip: '' },
        licensing: {
          licenseTypes: {
            'single-use': true,
          },
          licensePrices: {
            'single-use': '',
          },
          agreedToFee: false,
        },
        confirmations: { rightsConfirmed: false },
        existingFiles: emptyExistingFiles(),
        isEditing: false,
        ui: { loading: false },
      }),
  }
}

export const locationStore = createLocationStore()

export const isFormValid = derived(locationStore, ($s) => {
  const enabledLicenseTypes = Object.entries($s.licensing.licenseTypes).filter(([, enabled]) => enabled)
  const hasLicenseType = enabledLicenseTypes.length > 0

  if ($s.isEditing) {
    return hasLicenseType && $s.licensing.agreedToFee
  }

  const hasValidLicensePrice = enabledLicenseTypes.every(([id]) => Number($s.licensing.licensePrices[id] || 0) >= 0.5)

  return hasLicenseType && hasValidLicensePrice && $s.licensing.agreedToFee
})
