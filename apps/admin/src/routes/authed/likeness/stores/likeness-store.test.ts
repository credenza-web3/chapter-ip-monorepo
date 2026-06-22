import { expect, test, vi } from 'vitest'
import { loadExistingFiles } from './likeness-store'

type LoadExistingFilesContent = Parameters<typeof loadExistingFiles>[0]
type LoadExistingFilesClient = Parameters<typeof loadExistingFiles>[1]
type GetContentAllFilesLinkQuery = LoadExistingFilesClient['contents']['getContentAllFilesLink']['query']
type GetContentAllFilesLinkInput = Parameters<GetContentAllFilesLinkQuery>[0]

test('loads existing likeness file URLs through the all files link endpoint', async () => {
  const queryInputs: GetContentAllFilesLinkInput[] = []
  const query = vi.fn(async (input: GetContentAllFilesLinkInput) => {
    queryInputs.push(input)
    return {
      files: [
        { id: 'file-headshot', label: 'headshot_1', url: 'https://r2.example/headshot' },
        { id: 'file-voice', label: 'voice_sample_1', url: 'https://r2.example/voice' },
      ],
    }
  })
  const trpcClient = {
    contents: {
      getContentAllFilesLink: { query },
    },
  } as unknown as LoadExistingFilesClient
  const content: LoadExistingFilesContent = {
    id: 'content-1',
    metadata: {
      uploadsByBucket: {
        headshots: ['headshot_1'],
        voiceSamples: ['voice_sample_1'],
      },
    },
  }

  await expect(loadExistingFiles(content, trpcClient)).resolves.toEqual({
    headshots: [{ id: 'file-headshot', name: 'headshot_1', url: 'https://r2.example/headshot' }],
    bodyShots: [],
    voiceSamples: [{ id: 'file-voice', name: 'voice_sample_1', url: 'https://r2.example/voice' }],
    videoReels: [],
  })
  expect(query).toHaveBeenCalledTimes(1)
  expect(queryInputs).toEqual([{ contentId: 'content-1' }])
})

test('skips loading links when content id is missing', async () => {
  const query = vi.fn()
  const trpcClient = {
    contents: {
      getContentAllFilesLink: { query },
    },
  } as unknown as LoadExistingFilesClient
  const content: LoadExistingFilesContent = {
    id: '',
  }

  await expect(loadExistingFiles(content, trpcClient)).resolves.toEqual({
    headshots: [],
    bodyShots: [],
    voiceSamples: [],
    videoReels: [],
  })
  expect(query).not.toHaveBeenCalled()
})

test('skips returned file links that are not tracked in uploads metadata', async () => {
  const query = vi.fn(async () => ({
    files: [
      { id: 'file-headshot', label: 'headshot_1', url: 'https://r2.example/headshot' },
      { id: 'file-untracked', label: 'untracked_file', url: 'https://r2.example/untracked' },
    ],
  }))
  const trpcClient = {
    contents: {
      getContentAllFilesLink: { query },
    },
  } as unknown as LoadExistingFilesClient
  const content: LoadExistingFilesContent = {
    id: 'content-1',
    metadata: {
      uploadsByBucket: {
        headshots: ['headshot_1'],
      },
    },
  }

  await expect(loadExistingFiles(content, trpcClient)).resolves.toEqual({
    headshots: [{ id: 'file-headshot', name: 'headshot_1', url: 'https://r2.example/headshot' }],
    bodyShots: [],
    voiceSamples: [],
    videoReels: [],
  })
  expect(query).toHaveBeenCalledTimes(1)
})
