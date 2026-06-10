<script lang="ts">
  import { afterNavigate, beforeNavigate, goto } from '$app/navigation'
  import { likenessStore } from './stores/likeness-store'
  import UploadStepHeader from './components/UploadStepHeader.svelte'
  import UploadLikenessStep from './components/UploadLikenessStep.svelte'
  import UploadLicensingStep from './components/UploadLicensingStep.svelte'
  import ConfirmLikenessStep from './components/ConfirmLikenessStep.svelte'
  import { BlockchainService, UploadService, TransactionService, authStore } from '$lib'
  import { notify, ToastType } from '@repo/ui-components'
  import { modals, type ModalProps } from 'svelte-modals'
  import { ConfirmModal, type TConfirmModalProps } from '@repo/ui-components'

  let currentStep = $state(1)
  const blockchainService = new BlockchainService(authStore.state.accessToken!)
  const transactionService = new TransactionService(blockchainService)
  const uploadService = new UploadService(transactionService)

  beforeNavigate(() => likenessStore.setLoading(true))
  afterNavigate(() => likenessStore.setLoading(false))

  const onSubmitClick = async () => {
    try {
      likenessStore.setLoading(true)
      const trpcClient = uploadService.createTrpcClient()

      const uploads = [
        ...$likenessStore.files.headshots,
        ...$likenessStore.files.bodyShots,
        ...$likenessStore.files.videoReels,
        ...$likenessStore.files.voiceSamples,
      ]

      const uploadsByBucket = Object.entries($likenessStore.files).reduce(
        (acc, [bucket, files]) => {
          acc[bucket] = files.map((f) => f.name)
          return acc
        },
        {} as Record<string, string[]>,
      )

      const { tokenId, keys } = await uploadService.uploadContent({
        trpcClient,
        uploads,
        metadata: {
          profile: $likenessStore.profile,
          licensing: $likenessStore.licensing,
          uploadsByBucket,
          type: 'likeness',
        },
        lifetimePrice: Number($likenessStore.licensing.licensePrices['perpetual']),
        oneTimePrice: Number($likenessStore.licensing.licensePrices['single-use']),
      })

      const stagename = $likenessStore.profile.stageName
      await uploadService.saveMetadata({
        tokenId,
        keys,
        title: `${$likenessStore.profile.fullLegalName} ${stagename ? `(${stagename})` : ''}`,
        description: $likenessStore.profile.bio,
        trpcClient,
      })

      modals.open<ModalProps & TConfirmModalProps>(ConfirmModal, {
        title: 'Congratulations!',
        description:
          'Vestibulum mollis lacinia ligula in pellentesque. Sed eu justo ligula. Donec vel nisl sit amet orci condimentum egestas nec euismod diam. Interdum et malesuada fames ac ante ipsum. Sed hendrerit libero vitae sem tristique auctor. Etiam quis quam rhoncus, vehicula ligula ut.',
        submitText: 'Go to Dashboard',
        onSubmit: async () => {
          await goto(`/authed/files`)
          likenessStore.reset()
        },
        onClose: async () => {
          await goto(`/authed/files`)
          likenessStore.reset()
        },
        withBackButton: false,
      })
    } catch (error) {
      console.error('Error uploading file:', error)
      let errorMessage = 'Failed to upload file.'
      if (error instanceof Error && error.message.includes('duplicate key error')) {
        errorMessage = errorMessage + ' This file already exists.'
      }
      notify(errorMessage, ToastType.FAIL)
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
