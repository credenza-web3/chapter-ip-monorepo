<script lang="ts">
  import { afterNavigate, beforeNavigate, goto } from '$app/navigation'
  import { locationStore } from './stores/location-store'
  import UploadStepHeader from './components/UploadStepHeader.svelte'
  import UploadLocationStep from './components/UploadLocationStep.svelte'
  import UploadLicensingStep from './components/UploadLicensingStep.svelte'
  import ConfirmLocationStep from './components/ConfirmLocationStep.svelte'
  import { authStore } from '$lib'
  import UploadService from '$lib/upload/upload.service'
  import TransactionService from '$lib/upload/transaction.service'
  import BlockchainService from '$lib/upload/blockchain.service'
  import { notify, ToastType } from '@repo/ui-components'
  import { modals, type ModalProps } from 'svelte-modals'
  import { ConfirmModal, type TConfirmModalProps } from '@repo/ui-components'

  const LOCATION_FILENAME = 'location'

  let currentStep = $state(1)
  const blockchainService = new BlockchainService(authStore.state.accessToken!)
  const transactionService = new TransactionService(blockchainService)
  const uploadService = new UploadService(transactionService)

  beforeNavigate(() => locationStore.setLoading(true))
  afterNavigate(() => locationStore.setLoading(false))

  const buildLocationPayload = () => {
    const newFileCount = $locationStore.files.locations.length
    const uploadNames = Array.from({ length: newFileCount }, () => LOCATION_FILENAME)
    const uploads = $locationStore.files.locations.map((file, index) => ({
      file,
      name: uploadNames[index],
    }))
    const { licenseTypes, licensePrices, agreedToFee } = $locationStore.licensing
    const { street, apt, city, state, zip } = $locationStore.address
    const address = street || city || state || zip ? { street, apt, city, state, zip } : undefined
    const firstFile = $locationStore.files.locations[0]
    const ext = firstFile?.name.split('.').pop() || ''
    const fileName = ext ? `${LOCATION_FILENAME}.${ext}` : LOCATION_FILENAME
    const metadata: Record<string, unknown> = {
      type: 'location' as const,
      name: $locationStore.name,
      description: $locationStore.description,
      file_name: fileName,
      licensing: { licenseTypes, licensePrices, agreedToFee },
      ...(address && { address }),
    }

    return { uploads, metadata, tags: $locationStore.tags }
  }

  const onSaveDraftClick = async () => {
    try {
      locationStore.setLoading(true)
      const trpcClient = uploadService.createTrpcClient()
      const { uploads, metadata, tags } = buildLocationPayload()

      await uploadService.saveDraftContent({
        trpcClient,
        uploads,
        metadata,
        tags,
        withWatermark: false,
      })
      notify('Draft saved', ToastType.SUCCESS)
      await goto('/authed/files')
      locationStore.reset()
    } catch (error) {
      console.error('Error saving draft:', error)
      notify('Failed to save draft.', ToastType.FAIL)
    } finally {
      locationStore.setLoading(false)
    }
  }

  const onSubmitClick = async () => {
    try {
      locationStore.setLoading(true)
      const trpcClient = uploadService.createTrpcClient()
      const { uploads, metadata, tags } = buildLocationPayload()
      const { contentId, keys } = await uploadService.saveDraftContent({
        trpcClient,
        uploads,
        metadata,
        tags,
        withWatermark: false,
      })

      const tokenId = await uploadService.mintContent({
        oneTimePrice: Number($locationStore.licensing.licensePrices['single-use']),
      })
      await uploadService.finalizeContent({ trpcClient, contentId, metadata, tokenId, tags })

      await uploadService.saveMetadata({
        tokenId,
        keys,
        title: $locationStore.name,
        description: $locationStore.description,
        trpcClient,
      })

      modals.open<ModalProps & TConfirmModalProps>(ConfirmModal, {
        title: 'Congratulations!',
        description:
          "Your location has been added to Chapter IP. By completing this step, you've transformed your location into a secure, licensable digital asset that can be discovered, verified, and managed for future opportunities.",
        submitText: 'Go to Dashboard',
        onSubmit: async () => {
          await goto('/authed/files')
          locationStore.reset()
        },
        onClose: async () => {
          await goto('/authed/files')
          locationStore.reset()
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
      locationStore.setLoading(false)
    }
  }
</script>

<div class="min-h-xl rounded-3xl p-5 shadow-md md:p-10 bg-[#f8f5f1]">
  <UploadStepHeader {currentStep} />

  {#if currentStep === 1}
    <UploadLocationStep bind:currentStep onSaveDraft={onSaveDraftClick} />
  {:else if currentStep === 2}
    <UploadLicensingStep bind:currentStep onSaveDraft={onSaveDraftClick} />
  {:else}
    <ConfirmLocationStep bind:currentStep onFormSubmit={onSubmitClick} onSaveDraft={onSaveDraftClick} />
  {/if}
</div>
