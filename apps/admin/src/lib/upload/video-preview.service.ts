import { VIDEO_EXTENSIONS } from '@repo/fe-services'

export const isVideoFile = (file: File): boolean => {
  if (file.type.startsWith('video/')) return true
  const fileName = file.name ?? ''
  const ext = fileName.slice(fileName.lastIndexOf('.')).toLowerCase()
  return VIDEO_EXTENSIONS.includes(ext as (typeof VIDEO_EXTENSIONS)[number])
}

export const isVideoFilename = (filename: string): boolean => {
  const ext = filename.slice(filename.lastIndexOf('.')).toLowerCase()
  return VIDEO_EXTENSIONS.includes(ext as (typeof VIDEO_EXTENSIONS)[number])
}

export const createVideoThumbnail = async (file: File): Promise<File> => {
  const video = document.createElement('video')
  video.preload = 'metadata'
  video.muted = true
  video.playsInline = true

  const objectUrl = URL.createObjectURL(file)

  try {
    await new Promise<void>((resolve, reject) => {
      video.onloadeddata = () => resolve()
      video.onerror = () => reject(new Error(`Failed to load video: ${file.name}`))
      video.src = objectUrl
      setTimeout(() => reject(new Error('Video load timed out')), 5000)
    })

    video.currentTime = Math.min(1, video.duration * 0.1) || 0
    await new Promise<void>((resolve) => {
      video.onseeked = () => resolve()
    })

    const canvas = document.createElement('canvas')
    const maxDim = 900
    const ratio = Math.min(maxDim / video.videoWidth, maxDim / video.videoHeight, 1)
    canvas.width = Math.round(video.videoWidth * ratio)
    canvas.height = Math.round(video.videoHeight * ratio)

    const ctx = canvas.getContext('2d')!
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Failed to create thumbnail'))), 'image/jpeg', 0.8)
    })

    const thumbName = file.name.replace(/\.[^.]+$/, '.jpg')
    return new File([blob], thumbName, { type: 'image/jpeg', lastModified: Date.now() })
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}
