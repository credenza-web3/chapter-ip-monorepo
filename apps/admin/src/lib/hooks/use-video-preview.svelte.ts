import { onDestroy } from 'svelte'
import { SvelteSet } from 'svelte/reactivity'

export function useVideoPreview() {
  // eslint-disable-next-line prefer-const
  let videoThumbnails = $state<Record<string, string>>({})
  const generating = new SvelteSet<string>()
  // eslint-disable-next-line svelte/prefer-svelte-reactivity
  const blobUrlCache = new Map<string, string>()

  onDestroy(() => {
    for (const url of blobUrlCache.values()) URL.revokeObjectURL(url)
    blobUrlCache.clear()
  })

  function getFileUrl(file: File): string {
    const key = file.name + file.size
    let url = blobUrlCache.get(key)
    if (!url) {
      url = URL.createObjectURL(file)
      blobUrlCache.set(key, url)
    }
    return url
  }

  function ensureVideoThumbnail(file: File) {
    const key = file.name + file.size
    if (videoThumbnails[key] || generating.has(key)) return
    generating.add(key)

    const objectUrl = URL.createObjectURL(file)
    const video = document.createElement('video')
    video.preload = 'auto'
    video.muted = true
    video.playsInline = true

    video.onloadeddata = () => {
      video.currentTime = Math.min(1, (video.duration || 0) * 0.1) || 0
    }

    video.onseeked = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        canvas.getContext('2d')!.drawImage(video, 0, 0)
        videoThumbnails[key] = canvas.toDataURL('image/jpeg', 0.8)
      } finally {
        video.removeAttribute('src')
        video.load()
        setTimeout(() => URL.revokeObjectURL(objectUrl), 100)
      }
    }

    video.onerror = () => {
      generating.delete(key)
      video.removeAttribute('src')
      video.load()
      setTimeout(() => URL.revokeObjectURL(objectUrl), 100)
    }

    video.src = objectUrl
  }

  function getVideoThumbnail(file: File): string {
    return videoThumbnails[file.name + file.size] ?? ''
  }

  return {
    get videoThumbnails() {
      return videoThumbnails
    },
    getFileUrl,
    ensureVideoThumbnail,
    getVideoThumbnail,
  }
}
