<script lang="ts">
  import { createLikenessFileNames, LIKENESS_FILE_BUCKETS } from '$lib/constants/likenessFileBuckets'
  import { afterNavigate, beforeNavigate, goto } from '$app/navigation'
  import { getHeightTotalInches, getNormalizedWeight, likenessStore } from '../stores/likeness-store'
  import UploadStepHeader from '../components/UploadStepHeader.svelte'
  import UploadLikenessStep from '../components/UploadLikenessStep.svelte'
  import UploadLicensingStep from '../components/UploadLicensingStep.svelte'
  import ConfirmLikenessStep from '../components/ConfirmLikenessStep.svelte'

  import { authStore } from '$lib'
  import UploadService from '$lib/upload/upload.service'
  import TransactionService from '$lib/upload/transaction.service'
  import BlockchainService from '$lib/upload/blockchain.service'
  import uploadFileToBucket from '$lib/upload/file-upload.service'
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

      const uploadsByBucket = Object.fromEntries(
        buckets.map((bucket) => {
          const existingNames = $likenessStore.existingFiles[bucket].map((file) => file.name)
          const newNames = createLikenessFileNames(bucket, $likenessStore.files[bucket].length, existingNames)
          return [bucket, [...existingNames, ...newNames]]
        }),
      )

      for (const bucket of buckets) {
        const existingFileCount = $likenessStore.existingFiles[bucket].length

        for (const [index, file] of $likenessStore.files[bucket].entries()) {
          const name = uploadsByBucket[bucket][existingFileCount + index]
          const { url, key } = await trpcClient.contents.createContentFileUploadUrl.mutate({
            contentId,
            mimetype: file.type,
            filename: name,
          })
          await uploadFileToBucket(file, url)
          await trpcClient.contents.registerContentFile.mutate({
            contentId,
            key,
            filename: name,
            mimetype: file.type,
            label: name,
          })
        }
      }
      const heightTotalInches = getHeightTotalInches($likenessStore.profile.attributes)
      const weight = getNormalizedWeight($likenessStore.profile.attributes.weight)

      await trpcClient.contents.updateContentMetadata.mutate({
        contentId,
        metadata: {
          profile: {
            ...$likenessStore.profile,
            attributes: {
              ...$likenessStore.profile.attributes,
              weight,
              ...(heightTotalInches !== undefined && { heightTotalInches }),
            },
          },
          licensing: $likenessStore.licensing,
          uploadsByBucket,
          type: 'likeness',
        },
      })

      modals.open<ModalProps & TConfirmModalProps>(ConfirmModal, {
        title: 'Congratulations!',
        description:
          "Your likeness has been added to Chapter IP. By completing this step, you've transformed your likeness into a secure, licensable digital asset that can be discovered, verified, and managed for future opportunities.",
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
