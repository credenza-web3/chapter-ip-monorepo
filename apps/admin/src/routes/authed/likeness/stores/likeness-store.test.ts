import { expect, test, vi } from 'vitest'
import { loadExistingFiles } from './likeness-store'

type LoadExistingFilesContent = Parameters<typeof loadExistingFiles>[0]
type LoadExistingFilesClient = Parameters<typeof loadExistingFiles>[1]
type AllFilesLinkInput = {
  contentId: string
  licenseTokenId?: string
}

test('loads existing likeness file URLs through the all files link endpoint', async () => {
  const queryInputs: AllFilesLinkInput[] = []
  const query = vi.fn(async (input: AllFilesLinkInput) => {
    queryInputs.push(input)
    return {
      files: [
        { id: 'file-headshot', label: 'Headshot', url: 'https://r2.example/headshot' },
        { id: 'file-voice', label: 'Voice sample', url: 'https://r2.example/voice' },
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
        voiceSamples: ['voice_1'],
      },
    },
    files: [
      {
        id: 'file-headshot',
        filename: 'headshot_1',
        label: 'Headshot',
        mimetype: 'image/jpeg',
      },
      {
        id: 'file-voice',
        filename: 'voice_1',
        label: 'Voice sample',
        mimetype: 'audio/mpeg',
      },
    ],
  }

  await expect(loadExistingFiles(content, trpcClient)).resolves.toEqual({
    headshots: [{ id: 'file-headshot', name: 'headshot_1', url: 'https://r2.example/headshot' }],
    bodyShots: [],
    voiceSamples: [{ id: 'file-voice', name: 'voice_1', url: 'https://r2.example/voice' }],
    videoReels: [],
  })
  expect(query).toHaveBeenCalledTimes(1)
  expect(queryInputs).toEqual([{ contentId: 'content-1' }])
})
