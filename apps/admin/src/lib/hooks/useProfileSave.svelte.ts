import { notify, ToastType } from '@repo/ui-components'
import { publisherStore } from '$lib/stores/publisher.svelte'
import { savePublisher } from '$lib/services/publisher'
import { uploadFileToBucket } from '$lib/upload'
import type { TRPCClient, AppRouter } from '@repo/trpc/client'

interface ProfileData {
  publisherName: string
  avatarUrl: string
}

interface SaveResult {
  success: boolean
  error?: string
}
export function useProfileSave(trpcClient: TRPCClient<AppRouter>) {
  let loading = $state(false)

  // Profile data state
  const profileData = $state<ProfileData>({
    publisherName: publisherStore.title || '',
    avatarUrl: publisherStore.avatarUrl || '',
  })

  // Original values for change detection
  const originalData = $state<ProfileData>({
    publisherName: publisherStore.title || '',
    avatarUrl: publisherStore.avatarUrl || '',
  })

  // Check if any fields have changed
  const hasChanges = $derived(
    profileData.publisherName !== originalData.publisherName || profileData.avatarUrl !== originalData.avatarUrl,
  )

  // Update functions for child components
  function updatePublisherData(name: string, avatar: string): void {
    profileData.publisherName = name
    profileData.avatarUrl = avatar
  }

  async function handleSaveAll(): Promise<void> {
    if (!hasChanges || loading) return

    loading = true

    try {
      const savePromises: Promise<SaveResult>[] = []
      // Save publisher info if changed
      if (
        profileData.publisherName !== originalData.publisherName ||
        profileData.avatarUrl !== originalData.avatarUrl
      ) {
        const publisherPromise = (async (): Promise<SaveResult> => {
          let avatarUrl = profileData.avatarUrl

          if (publisherStore.avatarFile) {
            const file = publisherStore.avatarFile
            const ext = file.name.split('.').pop() || ''

            const { url, key } = await trpcClient.contents.createUserFileUploadUrl.mutate({
              filename: 'avatar',
              mimetype: file.type,
              extension: ext,
              bucket: 'userfiles',
            })
            await uploadFileToBucket(file, url)

            // avatarUrl = url.split('?')[0]

            avatarUrl = `${import.meta.env.VITE_USERFILES_BUCKET_HOST}/${key}`
          }
          const result = await savePublisher(trpcClient, profileData.publisherName, avatarUrl)
          if (result.success) {
            publisherStore.setData({ title: profileData.publisherName, avatarUrl })
            publisherStore.clearAvatarFile()
            originalData.publisherName = profileData.publisherName
            originalData.avatarUrl = avatarUrl
            profileData.avatarUrl = avatarUrl
          }
          return result as SaveResult
        })()
        savePromises.push(publisherPromise)
      }

      const results = await Promise.all(savePromises)

      // Check if any operations failed
      const failures = results.filter((result) => !result.success)
      if (failures.length > 0) {
        const errorMessages = failures
          .map((f) => f.error)
          .filter(Boolean)
          .join('; ')
        throw new Error(`Some operations failed: ${errorMessages}`)
      }

      notify('All changes saved successfully!', ToastType.SUCCESS)
    } catch (error) {
      console.error('Error saving changes:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      notify(`Error saving changes: ${errorMessage}`, ToastType.FAIL)
      throw error
    } finally {
      loading = false
    }
  }

  return {
    get loading() {
      return loading
    },
    get hasChanges() {
      return hasChanges
    },
    updatePublisherData,
    handleSaveAll,
  }
}
