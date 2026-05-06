import { writable, derived } from 'svelte/store'

interface UploadState {
  files: {
    source: File | null
    preview: File | null
  }

  profile: {
    fullLegalName: string
    stageName: string
    bio: string

    attributes: {
      ethnicity: string
      heightFt: string
      heightIn: string
      weight: string
      eyeColor: string
      hairColor: string
    }

    affiliations: {
      union: string
      memberId: string
    }[]
  }

  licensing: {
    isLifetime: boolean
    isOneTime: boolean
    lifetimePrice: number
    oneTimePrice: number
  }

  confirmations: {
    rightsConfirmed: boolean
  }

  ui: {
    loading: boolean
  }
}

function createUploadStore() {
  const { subscribe, set, update } = writable<UploadState>({
    files: {
      source: null,
      preview: null,
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
    },

    confirmations: {
      rightsConfirmed: false,
    },

    ui: {
      loading: false,
    },
  })

  return {
    subscribe,
    set,

    setUploaded: (file: File | null) =>
      update((s) => ({
        ...s,
        files: {
          ...s.files,
          source: file,
        },
        licensing: {
          isLifetime: false,
          isOneTime: false,
          lifetimePrice: 0,
          oneTimePrice: 0,
        },
      })),

    setUploadedImage: (file: File | null) =>
      update((s) => ({
        ...s,
        files: {
          ...s.files,
          preview: file,
        },
      })),

    setFullLegalName: (value: string) =>
      update((s) => ({
        ...s,
        profile: { ...s.profile, fullLegalName: value },
      })),

    setStageName: (value: string) =>
      update((s) => ({
        ...s,
        profile: { ...s.profile, stageName: value },
      })),

    setBio: (value: string) =>
      update((s) => ({
        ...s,
        profile: { ...s.profile, bio: value },
      })),

    setAttribute: (key: keyof UploadState['profile']['attributes'], value: string) =>
      update((s) => ({
        ...s,
        profile: {
          ...s.profile,
          attributes: {
            ...s.profile.attributes,
            [key]: value,
          },
        },
      })),

    addAffiliation: () =>
      update((s) => ({
        ...s,
        profile: {
          ...s.profile,
          affiliations: [...s.profile.affiliations, { union: '', memberId: '' }],
        },
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

    setLifetimeLicense: (value: boolean) =>
      update((s) => ({
        ...s,
        licensing: {
          ...s.licensing,
          isLifetime: value,
          lifetimePrice: value ? s.licensing.lifetimePrice : 0,
        },
      })),

    setOneTimeLicense: (value: boolean) =>
      update((s) => ({
        ...s,
        licensing: {
          ...s.licensing,
          isOneTime: value,
          oneTimePrice: value ? s.licensing.oneTimePrice : 0,
        },
      })),

    setLifetimePrice: (price: number) =>
      update((s) => ({
        ...s,
        licensing: { ...s.licensing, lifetimePrice: price },
      })),

    setOneTimePrice: (price: number) =>
      update((s) => ({
        ...s,
        licensing: { ...s.licensing, oneTimePrice: price },
      })),

    setRightsConfirmed: (value: boolean) =>
      update((s) => ({
        ...s,
        confirmations: { ...s.confirmations, rightsConfirmed: value },
      })),

    setLoading: (loading: boolean) =>
      update((s) => ({
        ...s,
        ui: { ...s.ui, loading },
      })),

    reset: () =>
      set({
        files: { source: null, preview: null },
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
        },
        confirmations: {
          rightsConfirmed: false,
        },
        ui: { loading: false },
      }),
  }
}

export const uploadStore = createUploadStore()

export const isFormValid = derived(
  uploadStore,
  ($s) =>
    ($s.licensing.isLifetime && $s.licensing.lifetimePrice > 0) ||
    ($s.licensing.isOneTime && $s.licensing.oneTimePrice > 0),
)
