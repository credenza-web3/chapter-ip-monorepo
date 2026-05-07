import { writable, derived } from 'svelte/store'

type YesNo = 'yes' | 'no' | null

interface UploadState {
  files: {
    source: File | null
    preview: File | null
    headshots: File | null
    bodyShots: File | null
    voiceSamples: File | null
    videoReels: File | null
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
    licenseTypes: Record<string, boolean>
    licensePrices: Record<string, string>
    licenseDropdowns: Record<string, string>
    permittedUses: Record<string, boolean>
    territories: string[]
    allowRetouching: YesNo
    approveFinalUse: YesNo
    agreedToFee: boolean
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
      headshots: null,
      bodyShots: null,
      voiceSamples: null,
      videoReels: null,
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
        'time-limited': '1 Year',
        perpetual: 'Annual',
        bulk: 'Member',
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
          licenseTypes: {
            ...s.licensing.licenseTypes,
            'single-use': true,
            'time-limited': false,
            perpetual: false,
            'ai-digital': false,
            bulk: false,
          },
          licensePrices: {
            ...s.licensing.licensePrices,
            'single-use': '0',
            'time-limited': '0',
            perpetual: '0',
            'ai-digital': '0',
            bulk: '0',
          },
          licenseDropdowns: {
            ...s.licensing.licenseDropdowns,
            'time-limited': '1 Year',
            perpetual: 'Annual',
            bulk: 'Member',
          },
          permittedUses: {},
          territories: ['United States only'],
          allowRetouching: null,
          approveFinalUse: null,
          agreedToFee: false,
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

    setMediaFile: (key: 'preview' | 'headshots' | 'bodyShots' | 'voiceSamples' | 'videoReels', file: File | null) =>
      update((s) => ({
        ...s,
        files: {
          ...s.files,
          [key]: file,
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

    setLicenseTypeEnabled: (id: string, value: boolean) =>
      update((s) => {
        const nextLicensing = {
          ...s.licensing,
          licenseTypes: {
            ...s.licensing.licenseTypes,
            [id]: value,
          },
        }

        if (id === 'single-use') {
          nextLicensing.isOneTime = value
          nextLicensing.oneTimePrice = value ? Number(nextLicensing.licensePrices[id] || 0) : 0
        }

        if (id === 'perpetual') {
          nextLicensing.isLifetime = value
          nextLicensing.lifetimePrice = value ? Number(nextLicensing.licensePrices[id] || 0) : 0
        }

        return {
          ...s,
          licensing: nextLicensing,
        }
      }),

    setLicenseTypePrice: (id: string, value: string) =>
      update((s) => {
        const safeValue = value.replace(/[^\d.]/g, '')
        const nextLicensing = {
          ...s.licensing,
          licensePrices: {
            ...s.licensing.licensePrices,
            [id]: safeValue,
          },
        }

        if (id === 'single-use') {
          nextLicensing.oneTimePrice = Number(safeValue || 0)
        }

        if (id === 'perpetual') {
          nextLicensing.lifetimePrice = Number(safeValue || 0)
        }

        return {
          ...s,
          licensing: nextLicensing,
        }
      }),

    setLicenseTypeDropdown: (id: string, value: string) =>
      update((s) => ({
        ...s,
        licensing: {
          ...s.licensing,
          licenseDropdowns: {
            ...s.licensing.licenseDropdowns,
            [id]: value,
          },
        },
      })),

    setPermittedUse: (id: string, value: boolean) =>
      update((s) => ({
        ...s,
        licensing: {
          ...s.licensing,
          permittedUses: {
            ...s.licensing.permittedUses,
            [id]: value,
          },
        },
      })),

    setAllPermittedUses: (ids: string[], value: boolean) =>
      update((s) => ({
        ...s,
        licensing: {
          ...s.licensing,
          permittedUses: Object.fromEntries(ids.map((id) => [id, value])),
        },
      })),

    setTerritories: (territories: string[]) =>
      update((s) => ({
        ...s,
        licensing: {
          ...s.licensing,
          territories,
        },
      })),

    setAllowRetouching: (value: YesNo) =>
      update((s) => ({
        ...s,
        licensing: {
          ...s.licensing,
          allowRetouching: value,
        },
      })),

    setApproveFinalUse: (value: YesNo) =>
      update((s) => ({
        ...s,
        licensing: {
          ...s.licensing,
          approveFinalUse: value,
        },
      })),

    setAgreedToFee: (value: boolean) =>
      update((s) => ({
        ...s,
        licensing: {
          ...s.licensing,
          agreedToFee: value,
        },
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
        files: {
          source: null,
          preview: null,
          headshots: null,
          bodyShots: null,
          voiceSamples: null,
          videoReels: null,
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
            'time-limited': '1 Year',
            perpetual: 'Annual',
            bulk: 'Member',
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
        ui: { loading: false },
      }),
  }
}

export const uploadStore = createUploadStore()

export const isFormValid = derived(uploadStore, ($s) => {
  const enabledLicenseTypes = Object.entries($s.licensing.licenseTypes).filter(([, enabled]) => enabled)
  const hasLicenseType = enabledLicenseTypes.length > 0
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
