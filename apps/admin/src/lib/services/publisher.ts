import { notify, ToastType } from '@repo/ui-components'

export async function savePublisher(trpcClient: any, publisherName: string, avatarUrl: string) {
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
