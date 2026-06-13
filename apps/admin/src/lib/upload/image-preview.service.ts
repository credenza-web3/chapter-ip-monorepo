import imageCompression from 'browser-image-compression'
import watermark from 'watermarkjs'
import watermarkUrl from '@repo/ui-components/assets/ch-logo.svg'

const PREVIEW_IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])

export const isPreviewImage = (file: File): boolean => PREVIEW_IMAGE_MIME_TYPES.has(file.type)

export const createImagePreview = async (file: File): Promise<File> => {
  const outputMimetype = file.type === 'image/jpg' ? 'image/jpeg' : file.type
  const compressedFile = await imageCompression(file, {
    maxSizeMB: 0.2,
    maxWidthOrHeight: 900,
    useWebWorker: true,
    fileType: outputMimetype,
  })

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
