import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  createImagePreview: vi.fn(),
  uploadFileToBucket: vi.fn(),
}))

vi.mock('$lib', () => ({
  authStore: {
    state: {
      accessToken: 'access-token',
    },
  },
}))

vi.mock('@repo/fe-services', () => ({
  r2Config: {
    url: 'https://example.com/',
    defaultImage: 'default.png',
  },
}))

vi.mock('./image-preview.service', () => ({
  createImagePreview: mocks.createImagePreview,
  isPreviewImage: (file: File) => ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type),
}))

vi.mock('./file-upload.service', () => ({
  default: mocks.uploadFileToBucket,
}))

import UploadService from './upload.service'

const createTrpcClient = () => {
  const createContentFileUploadUrl = vi
    .fn()
    .mockResolvedValueOnce({ url: 'original-url', key: 'original-key' })
    .mockResolvedValueOnce({ url: 'preview-url', key: 'preview-key' })
  const registerContentFile = vi.fn().mockResolvedValue({})

  const client = {
    contents: {
      registerContent: {
        mutate: vi.fn().mockResolvedValue({ id: 'content-id' }),
      },
      createContentFileUploadUrl: {
        mutate: createContentFileUploadUrl,
      },
      registerContentFile: {
        mutate: registerContentFile,
      },
    },
  }

  return { client, createContentFileUploadUrl, registerContentFile }
}

describe('UploadService.uploadContent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('uploads an image preview to the preview bucket without registering it', async () => {
    const original = new File(['original'], 'image.jpg', { type: 'image/jpg' })
    const preview = new File(['preview'], 'image.jpg', { type: 'image/jpeg' })
    const { client, createContentFileUploadUrl, registerContentFile } = createTrpcClient()
    mocks.createImagePreview.mockResolvedValue(preview)

    const transactionService = {
      mintWithPrices: vi.fn().mockResolvedValue('token-id'),
    }
    const service = new UploadService(transactionService as never)

    await expect(
      service.uploadContent({
        uploads: [{ file: original, name: 'headshot_1' }],
        metadata: {},
        lifetimePrice: 1,
        oneTimePrice: 2,
        trpcClient: client as never,
      }),
    ).resolves.toEqual({ tokenId: 'token-id', keys: ['original-key'] })

    expect(createContentFileUploadUrl).toHaveBeenNthCalledWith(2, {
      contentId: 'content-id',
      mimetype: 'image/jpeg',
      bucket: 'preview',
    })
    expect(mocks.uploadFileToBucket).toHaveBeenNthCalledWith(2, preview, 'preview-url')
    expect(registerContentFile).toHaveBeenCalledWith({
      contentId: 'content-id',
      key: 'original-key',
      filename: 'headshot_1',
      mimetype: 'image/jpg',
      label: 'headshot_1',
    })
  })

  it('keeps the original upload successful when preview creation fails', async () => {
    const original = new File(['original'], 'image.png', { type: 'image/png' })
    const { client, createContentFileUploadUrl, registerContentFile } = createTrpcClient()
    const previewError = new Error('preview failed')
    mocks.createImagePreview.mockRejectedValue(previewError)
    vi.spyOn(console, 'error').mockImplementation(() => undefined)

    const transactionService = {
      mintWithPrices: vi.fn().mockResolvedValue('token-id'),
    }
    const service = new UploadService(transactionService as never)

    await expect(
      service.uploadContent({
        uploads: [{ file: original, name: 'bodyshot_1' }],
        metadata: {},
        lifetimePrice: 1,
        oneTimePrice: 2,
        trpcClient: client as never,
      }),
    ).resolves.toEqual({ tokenId: 'token-id', keys: ['original-key'] })

    expect(createContentFileUploadUrl).toHaveBeenCalledTimes(1)
    expect(mocks.uploadFileToBucket).toHaveBeenCalledTimes(1)
    expect(registerContentFile).toHaveBeenCalledTimes(1)
    expect(console.error).toHaveBeenCalledWith('Failed to upload preview for image.png', previewError)
  })
})
