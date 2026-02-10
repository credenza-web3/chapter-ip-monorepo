import { writable, derived } from 'svelte/store'

interface UploadState {
  uploaded: File | null
  uploadedImage: File | null
  isLifetimeLicense: boolean
  isOneTimeLicense: boolean
  lifetimePrice: number
  oneTimePrice: number
  loading: boolean
}

function createUploadStore() {
  const { subscribe, set, update } = writable<UploadState>({
    uploaded: null,
    uploadedImage: null,
    isLifetimeLicense: false,
    isOneTimeLicense: false,
    lifetimePrice: 0,
    oneTimePrice: 0,
    loading: false,
  })

  return {
    subscribe,
    
    setUploaded: (file: File | null) => update(state => ({ 
      ...state, 
      uploaded: file,
      // Reset license state when new file is selected
      isLifetimeLicense: false,
      isOneTimeLicense: false,
      lifetimePrice: 0,
      oneTimePrice: 0
    })),
    
    setUploadedImage: (file: File | null) => update(state => ({ 
      ...state, 
      uploadedImage: file 
    })),
    
    setLifetimeLicense: (value: boolean) => update(state => ({ 
      ...state, 
      isLifetimeLicense: value,
      lifetimePrice: value ? state.lifetimePrice : 0
    })),
    
    setOneTimeLicense: (value: boolean) => update(state => ({ 
      ...state, 
      isOneTimeLicense: value,
      oneTimePrice: value ? state.oneTimePrice : 0
    })),
    
    setLifetimePrice: (price: number) => update(state => ({ 
      ...state, 
      lifetimePrice: price 
    })),
    
    setOneTimePrice: (price: number) => update(state => ({ 
      ...state, 
      oneTimePrice: price 
    })),
    
    setLoading: (loading: boolean) => update(state => ({ ...state, loading })),
    
    reset: () => set({
      uploaded: null,
      uploadedImage: null,
      isLifetimeLicense: false,
      isOneTimeLicense: false,
      lifetimePrice: 0,
      oneTimePrice: 0,
      loading: false,
    })
  }
}

export const uploadStore = createUploadStore()

// Derived store for form validation
export const isFormValid = derived(
  uploadStore,
  $uploadStore => 
    ($uploadStore.isLifetimeLicense && $uploadStore.lifetimePrice > 0) || 
    ($uploadStore.isOneTimeLicense && $uploadStore.oneTimePrice > 0)
)
