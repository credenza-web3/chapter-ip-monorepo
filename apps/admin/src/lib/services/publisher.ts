import { notify, ToastType } from '@repo/ui-components'
import type { TRPCClient, AppRouter } from '@repo/trpc/client'

export async function savePublisher(trpcClient: TRPCClient<AppRouter>, publisherName: string, avatarUrl: string) {
  try {
    await trpcClient.publishers.setPublisher.mutate({
      title: publisherName,
      avatarUrl,
    })
    return { success: true }
  } catch (error) {
    console.error(error)
    notify('Failed to save publisher', ToastType.FAIL)
    return { success: false, error }
  }
}
