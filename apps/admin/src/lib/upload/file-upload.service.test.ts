import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import uploadFileToBucket from './file-upload.service'

type XhrListener = ((event: ProgressEvent) => void) | null

class MockXMLHttpRequest {
  static instances: MockXMLHttpRequest[] = []

  open = vi.fn()
  setRequestHeader = vi.fn()
  send = vi.fn()
  status = 200
  statusText = 'OK'
  upload = { onprogress: null as XhrListener }
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
  onabort: (() => void) | null = null

  constructor() {
    MockXMLHttpRequest.instances.push(this)
  }

  simulateProgress(loaded: number, total: number) {
    this.upload.onprogress?.({ lengthComputable: true, loaded, total } as ProgressEvent)
  }

  simulateSuccess(status = 200, statusText = 'OK') {
    this.status = status
    this.statusText = statusText
    this.onload?.()
  }

  simulateNetworkError() {
    this.onerror?.()
  }

  simulateAbort() {
    this.onabort?.()
  }
}

describe('uploadFileToBucket', () => {
  beforeEach(() => {
    MockXMLHttpRequest.instances = []
    vi.stubGlobal('XMLHttpRequest', MockXMLHttpRequest)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('uploads a file with PUT and Content-Type header', async () => {
    const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' })
    const promise = uploadFileToBucket(file, 'https://example.com/upload')
    const xhr = MockXMLHttpRequest.instances[0]

    expect(xhr.open).toHaveBeenCalledWith('PUT', 'https://example.com/upload')
    expect(xhr.setRequestHeader).toHaveBeenCalledWith('Content-Type', 'image/jpeg')
    expect(xhr.send).toHaveBeenCalledWith(file)

    xhr.simulateSuccess()
    await expect(promise).resolves.toBeUndefined()
  })

  it('reports upload progress when length is computable', async () => {
    const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' })
    const onProgress = vi.fn()
    const promise = uploadFileToBucket(file, 'https://example.com/upload', onProgress)
    const xhr = MockXMLHttpRequest.instances[0]

    xhr.simulateProgress(25, 100)
    xhr.simulateProgress(100, 100)
    xhr.simulateSuccess()

    await promise

    expect(onProgress).toHaveBeenNthCalledWith(1, 0.25)
    expect(onProgress).toHaveBeenNthCalledWith(2, 1)
  })

  it('does not report progress when length is not computable', async () => {
    const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' })
    const onProgress = vi.fn()
    const promise = uploadFileToBucket(file, 'https://example.com/upload', onProgress)
    const xhr = MockXMLHttpRequest.instances[0]

    xhr.upload.onprogress?.({ lengthComputable: false, loaded: 0, total: 0 } as ProgressEvent)
    xhr.simulateSuccess()

    await promise

    expect(onProgress).not.toHaveBeenCalled()
  })

  it('rejects on non-2xx HTTP status', async () => {
    const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' })
    const promise = uploadFileToBucket(file, 'https://example.com/upload')
    const xhr = MockXMLHttpRequest.instances[0]

    xhr.simulateSuccess(500, 'Internal Server Error')

    await expect(promise).rejects.toThrow('Upload failed: 500 Internal Server Error')
  })

  it('rejects on network error', async () => {
    const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' })
    const promise = uploadFileToBucket(file, 'https://example.com/upload')
    const xhr = MockXMLHttpRequest.instances[0]

    xhr.simulateNetworkError()

    await expect(promise).rejects.toThrow('Upload failed: network error')
  })

  it('rejects on abort', async () => {
    const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' })
    const promise = uploadFileToBucket(file, 'https://example.com/upload')
    const xhr = MockXMLHttpRequest.instances[0]

    xhr.simulateAbort()

    await expect(promise).rejects.toThrow('Upload aborted')
  })

  it('does not report progress when total is zero', async () => {
    const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' })
    const onProgress = vi.fn()
    const promise = uploadFileToBucket(file, 'https://example.com/upload', onProgress)
    const xhr = MockXMLHttpRequest.instances[0]

    xhr.simulateProgress(0, 0)
    xhr.simulateSuccess()

    await promise

    expect(onProgress).not.toHaveBeenCalled()
  })
})
