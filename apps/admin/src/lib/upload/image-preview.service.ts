import imageCompression from 'browser-image-compression'
import watermark from 'watermarkjs'
import watermarkUrl from '@repo/ui-components/assets/ch-logo.svg'

const PREVIEW_IMAGE_EXTENSIONS = new Set(['.avif', '.gif', '.jpeg', '.jpg', '.png', '.svg', '.webp'])
const PREVIEW_OUTPUT_MIME_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])

const getPreviewOutputMimetype = (file: File): string =>
  PREVIEW_OUTPUT_MIME_TYPES.has(file.type) ? (file.type === 'image/jpg' ? 'image/jpeg' : file.type) : 'image/jpeg'

export const isPreviewImage = (file: File): boolean => {
  if (file.type.startsWith('image/')) return true

  const fileName = file.name ?? ''
  const extension = fileName.slice(fileName.lastIndexOf('.')).toLowerCase()
  return PREVIEW_IMAGE_EXTENSIONS.has(extension)
}

export const createImagePreview = async (file: File, options: { withWatermark?: boolean } = {}): Promise<File> => {
  const outputMimetype = getPreviewOutputMimetype(file)
  const compressedFile = await imageCompression(file, {
    maxSizeMB: 0.2,
    maxWidthOrHeight: 900,
    useWebWorker: true,
    fileType: outputMimetype,
  })

  if (options.withWatermark === false) {
    return new File([compressedFile], file.name, {
      type: outputMimetype,
      lastModified: Date.now(),
    })
  }

  try {
    const blob = await watermark([compressedFile, watermarkUrl], {
      type: outputMimetype,
      encoderOptions: 0.5,
    }).blob(watermark.image.center(0.35))

    return new File([blob], file.name, {
      type: outputMimetype,
      lastModified: Date.now(),
    })
  } finally {
    watermark.destroy()
  }
}
