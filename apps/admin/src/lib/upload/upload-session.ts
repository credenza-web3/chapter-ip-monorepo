import type { UploadProgressEvent } from './upload.service'

export type UploadSessionProgressSetter = (event: UploadProgressEvent) => void

export type UploadSession = {
  setProgress: UploadSessionProgressSetter
  end: () => void
}

export type UploadSessionStore = {
  setUploadProgress: (event: UploadProgressEvent) => void
  clearUploadProgress: () => void
  setLoading: (loading: boolean) => void
}

export function createUploadSessionController(store: UploadSessionStore) {
  let generation = 0

  const begin = (): UploadSession => {
    const currentGeneration = ++generation
    return {
      setProgress: (event: UploadProgressEvent) => {
        if (generation === currentGeneration) {
          store.setUploadProgress(event)
        }
      },
      end: () => {
        if (generation === currentGeneration) {
          store.clearUploadProgress()
          store.setLoading(false)
        }
      },
    }
  }

  const invalidate = () => {
    generation++
    store.clearUploadProgress()
  }

  return { begin, invalidate }
}

export function startUploadingPhase(setProgress: UploadSessionProgressSetter, uploadsLength: number) {
  if (uploadsLength > 0) {
    setProgress({ phase: 'uploading', overallProgress: 0 })
  }
}
