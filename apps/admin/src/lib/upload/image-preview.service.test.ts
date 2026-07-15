import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  blob: vi.fn(),
  center: vi.fn(),
  destroy: vi.fn(),
  imageCompression: vi.fn(),
  watermark: vi.fn(),
}))

vi.mock('browser-image-compression', () => ({
  default: mocks.imageCompression,
}))

vi.mock('watermarkjs', () => ({
  default: Object.assign(mocks.watermark, {
    image: {
      center: mocks.center,
    },
    destroy: mocks.destroy,
  }),
}))

vi.mock('@repo/ui-components/assets/watermark.svg', () => ({
  default: 'watermark.svg',
}))

import { createImagePreview, isPreviewImage } from './image-preview.service'

beforeEach(() => {
  vi.clearAllMocks()
  mocks.center.mockReturnValue('center-draw')
  mocks.watermark.mockReturnValue({ blob: mocks.blob })
})

describe('isPreviewImage', () => {
  it.each(['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif', 'image/gif', 'image/svg+xml'])(
    'accepts %s',
    (mimetype) => {
      expect(isPreviewImage({ type: mimetype } as File)).toBe(true)
    },
  )

  it('accepts a supported image filename when the browser does not provide a MIME type', () => {
    expect(isPreviewImage({ name: 'headshot.JPG', type: '' } as File)).toBe(true)
  })

  it.each(['application/pdf', 'audio/mpeg', 'video/mp4'])('rejects %s', (mimetype) => {
    expect(isPreviewImage({ type: mimetype } as File)).toBe(false)
  })
})

describe('createImagePreview', () => {
  it('compresses a jpg and applies one centered watermark', async () => {
    const original = new File(['original'], 'photo.jpg', { type: 'image/jpg' })
    const compressed = new File(['compressed'], 'photo.jpg', { type: 'image/jpeg' })
    mocks.imageCompression.mockResolvedValue(compressed)
    mocks.blob.mockResolvedValue(new Blob(['preview'], { type: 'image/jpeg' }))

    const preview = await createImagePreview(original)

    expect(mocks.imageCompression).toHaveBeenCalledWith(original, {
      maxSizeMB: 0.2,
      maxWidthOrHeight: 900,
      useWebWorker: true,
      fileType: 'image/jpeg',
    })
    expect(mocks.watermark).toHaveBeenCalledWith([compressed, 'watermark.svg'], {
      type: 'image/jpeg',
      encoderOptions: 0.5,
    })
    expect(mocks.center).toHaveBeenCalledWith(0.35)
    expect(mocks.blob).toHaveBeenCalledWith('center-draw')
    expect(preview.name).toBe('photo.jpg')
    expect(preview.type).toBe('image/jpeg')
    expect(mocks.destroy).toHaveBeenCalledOnce()
  })

  it('destroys the watermark canvas pool when processing fails', async () => {
    const original = new File(['original'], 'photo.png', { type: 'image/png' })
    const previewError = new Error('watermark failed')
    mocks.imageCompression.mockResolvedValue(original)
    mocks.blob.mockRejectedValue(previewError)

    await expect(createImagePreview(original)).rejects.toThrow(previewError)

    expect(mocks.destroy).toHaveBeenCalledOnce()
  })

  it('creates a JPEG preview for image formats without a supported preview output type', async () => {
    const original = new File(['original'], 'portrait.gif', { type: 'image/gif' })
    const compressed = new File(['compressed'], 'portrait.gif', { type: 'image/jpeg' })
    mocks.imageCompression.mockResolvedValue(compressed)
    mocks.blob.mockResolvedValue(new Blob(['preview'], { type: 'image/jpeg' }))

    const preview = await createImagePreview(original)

    expect(mocks.imageCompression).toHaveBeenCalledWith(original, {
      maxSizeMB: 0.2,
      maxWidthOrHeight: 900,
      useWebWorker: true,
      fileType: 'image/jpeg',
    })
    expect(preview.type).toBe('image/jpeg')
  })
})
