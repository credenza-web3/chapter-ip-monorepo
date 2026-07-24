import type { AppRouter, TRPCClient } from '@repo/trpc/client'
import type UploadService from '$lib/upload/upload.service'

export const appendOriginalExtension = (name: string, file: File) => {
  const ext = file.name.split('.').pop() || ''
  return ext ? `${name}.${ext}` : name
}

export async function uploadPreviewIfNeeded({
  previewImage,
  metadata,
  contentId,
  uploadService,
  trpcClient,
}: {
  previewImage: File | null
  metadata: Record<string, unknown>
  contentId: string
  uploadService: UploadService
  trpcClient: TRPCClient<AppRouter>
}): Promise<void> {
  if (!previewImage) return
  const previewFileName = metadata.preview_file_name as string
  await uploadService.uploadLocationPreviewImage({
    contentId,
    file: previewImage,
    filename: previewFileName,
    trpcClient,
  })
}
