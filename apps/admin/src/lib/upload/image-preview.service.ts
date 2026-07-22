import imageCompression from 'browser-image-compression'
import watermark from 'watermarkjs'
import watermarkUrl from '@repo/ui-components/assets/watermark.svg'

const PREVIEW_IMAGE_EXTENSIONS = new Set(['.avif', '.gif', '.jpeg', '.jpg', '.png', '.svg', '.webp'])
const COMPRESSIBLE_MIME_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])

const getPreviewOutputMimetype = (file: File): string => (file.type === 'image/jpg' ? 'image/jpeg' : file.type)

const isCompressibleImage = (file: File): boolean => COMPRESSIBLE_MIME_TYPES.has(file.type)

export const isPreviewImage = (file: File): boolean => {
  if (file.type.startsWith('image/')) return true

  const fileName = file.name ?? ''
  const extension = fileName.slice(fileName.lastIndexOf('.')).toLowerCase()
  return PREVIEW_IMAGE_EXTENSIONS.has(extension)
}

const returnOriginalAsPreview = (file: File): File => {
  const outputMimetype = getPreviewOutputMimetype(file)
  return new File([file], file.name, {
    type: outputMimetype,
    lastModified: Date.now(),
  })
}

export const createImagePreview = async (file: File, options: { withWatermark?: boolean } = {}): Promise<File> => {
  if (!isCompressibleImage(file)) {
    return returnOriginalAsPreview(file)
  }

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
