<script lang="ts">
  import { LIKENESS_FILE_BUCKETS } from '$lib/constants/likenessFileBuckets'
  import { afterNavigate, beforeNavigate, goto } from '$app/navigation'
  import { likenessStore } from '../stores/likeness-store'
  import UploadStepHeader from '../components/UploadStepHeader.svelte'
  import UploadLikenessStep from '../components/UploadLikenessStep.svelte'
  import UploadLicensingStep from '../components/UploadLicensingStep.svelte'
  import ConfirmLikenessStep from '../components/ConfirmLikenessStep.svelte'
  import { UploadService, uploadFileToBucket, BlockchainService, TransactionService, authStore } from '$lib'
  import { notify, ToastType, ConfirmModal, type TConfirmModalProps } from '@repo/ui-components'
  import { modals, type ModalProps } from 'svelte-modals'
  import { onDestroy, onMount } from 'svelte'

  let { data } = $props()

  let currentStep = $state(1)
  const blockchainService = new BlockchainService(authStore.state.accessToken!)
  const transactionService = new TransactionService(blockchainService)
  const uploadService = new UploadService(transactionService)

  onMount(() => likenessStore.hydrateFromContent(data, data.existingFiles))
  onDestroy(() => likenessStore.reset())

  beforeNavigate(() => likenessStore.setLoading(true))
  afterNavigate(() => likenessStore.setLoading(false))

  const onSubmitClick = async () => {
    try {
      likenessStore.setLoading(true)
      const trpcClient = uploadService.createTrpcClient()
      const contentId = data.id
      const buckets = LIKENESS_FILE_BUCKETS

      const keptFileIds = new Set(buckets.flatMap((bucket) => $likenessStore.existingFiles[bucket].map((f) => f.id)))
      for (const file of data.files ?? []) {
        if (!keptFileIds.has(file.id)) {
          await trpcClient.contents.removeContentFile.mutate({ fileId: file.id })
        }
      }

      for (const bucket of buckets) {
        for (const file of $likenessStore.files[bucket]) {
          const { url, key } = await trpcClient.contents.createContentFileUploadUrl.mutate({
            contentId,
            mimetype: file.type,
          })
          await uploadFileToBucket(file, url)
          await trpcClient.contents.registerContentFile.mutate({
            contentId,
            key,
            filename: file.name,
            mimetype: file.type,
            label: file.name,
          })
        }
      }

      const uploadsByBucket = Object.fromEntries(
        buckets.map((bucket) => [
          bucket,
          [
            ...$likenessStore.existingFiles[bucket].map((f) => f.name),
            ...$likenessStore.files[bucket].map((f) => f.name),
          ],
        ]),
      )

      await trpcClient.contents.updateContentMetadata.mutate({
        contentId,
        metadata: {
          profile: $likenessStore.profile,
          licensing: $likenessStore.licensing,
          uploadsByBucket,
          type: 'likeness',
        },
      })

      modals.open<ModalProps & TConfirmModalProps>(ConfirmModal, {
        title: 'Congratulations!',
        description:
          'Vestibulum mollis lacinia ligula in pellentesque. Sed eu justo ligula. Donec vel nisl sit amet orci condimentum egestas nec euismod diam. Interdum et malesuada fames ac ante ipsum. Sed hendrerit libero vitae sem tristique auctor. Etiam quis quam rhoncus, vehicula ligula ut.',
        submitText: 'Go to Dashboard',
        onSubmit: async () => {
          await goto('/authed/files')
          likenessStore.reset()
        },
        onClose: async () => {
          await goto('/authed/files')
          likenessStore.reset()
        },
        withBackButton: false,
      })
    } catch (error) {
      console.error('Error updating listing:', error)
      notify('Failed to update listing.', ToastType.FAIL)
    } finally {
      likenessStore.setLoading(false)
    }
  }
</script>

<div class="min-h-xl rounded-3xl p-5 shadow-md md:p-10 bg-[#f8f5f1]">
  <UploadStepHeader {currentStep} />

  {#if currentStep === 1}
    <UploadLikenessStep bind:currentStep />
  {:else if currentStep === 2}
    <UploadLicensingStep bind:currentStep />
  {:else}
    <ConfirmLikenessStep bind:currentStep onFormSubmit={onSubmitClick} />
  {/if}
</div>
