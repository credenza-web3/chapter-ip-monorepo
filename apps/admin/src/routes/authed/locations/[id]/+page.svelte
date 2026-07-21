<script lang="ts">
  import { LOCATION_FILE_BUCKETS } from '$lib/constants/locationFileBuckets'
  import { afterNavigate, beforeNavigate, goto } from '$app/navigation'
  import { locationStore } from '../stores/location-store'
  import UploadStepHeader from '../components/UploadStepHeader.svelte'
  import UploadLocationStep from '../components/UploadLocationStep.svelte'
  import UploadLicensingStep from '../components/UploadLicensingStep.svelte'
  import ConfirmLocationStep from '../components/ConfirmLocationStep.svelte'

  import { authStore } from '$lib'
  import UploadService, { type NamedUpload } from '$lib/upload/upload.service'
  import TransactionService from '$lib/upload/transaction.service'
  import BlockchainService from '$lib/upload/blockchain.service'
  import { notify, ToastType, ConfirmModal, type TConfirmModalProps } from '@repo/ui-components'
  import { modals, type ModalProps } from 'svelte-modals'
  import { onDestroy, onMount } from 'svelte'
  import { STATUS, type StatusValue } from '../constants/constants'

  let { data } = $props()

  type ExistingContentFile = {
    id: string
    key: string
  }

  let currentStep = $state(1)
  const blockchainService = new BlockchainService(authStore.state.accessToken!)
  const transactionService = new TransactionService(blockchainService)
  const uploadService = new UploadService(transactionService)

  onMount(() => locationStore.hydrateFromContent(data, data.existingFiles))
  onDestroy(() => locationStore.reset())

  beforeNavigate(() => locationStore.setLoading(true))
  afterNavigate(() => locationStore.setLoading(false))

  const LOCATION_FILENAME = 'location'

  const buildFileName = () => {
    const existingNames = $locationStore.existingFiles.locations.map((file) => file.name)
    if (existingNames.length > 0) {
      return existingNames[0]
    }
    const firstNewFile = $locationStore.files.locations[0]
    if (firstNewFile) {
      const ext = firstNewFile.name.split('.').pop() || ''
      return ext ? `${LOCATION_FILENAME}.${ext}` : LOCATION_FILENAME
    }
    return LOCATION_FILENAME
  }

  const buildLocationMetadata = () => {
    const { street, apt, city, state, zip } = $locationStore.address
    const address = street || city || state || zip ? { street, apt, city, state, zip } : undefined
    return {
      type: 'location' as const,
      name: $locationStore.name,
      description: $locationStore.description,
      file_name: buildFileName(),
      licensing: $locationStore.licensing,
      ...(address && { address }),
    }
  }

  const buildUploadNames = () => {
    const existingNames = $locationStore.existingFiles.locations.map((file) => file.name)
    const newCount = $locationStore.files.locations.length
    const names: string[] = [...existingNames]
    for (let i = 0; i < newCount; i++) {
      names.push(LOCATION_FILENAME)
    }
    return names
  }

  const buildNamedUploads = (uploadNames: string[]): NamedUpload[] => {
    const existingCount = $locationStore.existingFiles.locations.length
    return $locationStore.files.locations.map((file, index) => ({
      file,
      name: uploadNames[existingCount + index],
    }))
  }

  const getKeptFileIds = () =>
    new Set(LOCATION_FILE_BUCKETS.flatMap((bucket) => $locationStore.existingFiles[bucket].map((file) => file.id)))

  const getCurrentFiles = () => (data.files ?? []) as ExistingContentFile[]

  const buildLocationPayload = () => {
    const uploadNames = buildUploadNames()

    return {
      keptFileIds: getKeptFileIds(),
      metadata: buildLocationMetadata(),
      uploads: buildNamedUploads(uploadNames),
      tags: $locationStore.tags,
    }
  }

  const getLicensePrices = () => ({
    oneTimePrice: Number($locationStore.licensing.licensePrices['single-use']),
  })

  const buildTokenMetadata = (keys: string[]) => {
    return {
      keys,
      title: $locationStore.name,
      description: $locationStore.description,
    }
  }

  const saveCurrentContent = async ({
    status,
    tokenId,
  }: {
    status?: StatusValue
    tokenId?: string
  } = {}) => {
    const trpcClient = uploadService.createTrpcClient()
    const contentId = data.id
    const { keptFileIds, metadata, uploads, tags } = buildLocationPayload()
    const { keys } = await uploadService.updateContentFiles({
      contentId,
      currentFiles: getCurrentFiles(),
      keptFileIds,
      uploads,
      trpcClient,
    })

    await uploadService.updateContentMetadata({
      contentId,
      trpcClient,
      metadata,
      tags,
      tokenId,
      status,
    })

    return { contentId, keys, metadata, trpcClient, tags }
  }

  const goToFiles = async () => {
    await goto('/authed/files')
    locationStore.reset()
  }

  const withLocationLoading = async (action: () => Promise<void>, logMessage: string, userMessage: string) => {
    try {
      locationStore.setLoading(true)
      await action()
    } catch (error) {
      console.error(logMessage, error)
      notify(userMessage, ToastType.FAIL)
    } finally {
      locationStore.setLoading(false)
    }
  }

  const onSaveDraftClick = async () => {
    await withLocationLoading(
      async () => {
        await saveCurrentContent({ status: STATUS.DRAFT })
        notify('Draft saved', ToastType.SUCCESS)
        await goToFiles()
      },
      'Error saving draft:',
      'Failed to save draft.',
    )
  }

  const activateContent = async ({
    contentId,
    metadata,
    trpcClient,
    tags,
  }: Awaited<ReturnType<typeof saveCurrentContent>>) => {
    const tokenId = await uploadService.mintContent(getLicensePrices())

    await uploadService.finalizeContent({
      contentId,
      metadata,
      tokenId,
      trpcClient,
      tags,
    })

    return tokenId
  }

  const saveTokenMetadata = async ({
    tokenId,
    keys,
    trpcClient,
  }: Pick<Awaited<ReturnType<typeof saveCurrentContent>>, 'keys' | 'trpcClient'> & { tokenId: string }) => {
    await uploadService.saveMetadata({
      tokenId,
      trpcClient,
      ...buildTokenMetadata(keys),
    })
  }

  const openSuccessModal = () => {
    modals.open<ModalProps & TConfirmModalProps>(ConfirmModal, {
      title: 'Congratulations!',
      description:
        "Your location has been added to Chapter IP. By completing this step, you've transformed your location into a secure, licensable digital asset that can be discovered, verified, and managed for future opportunities.",
      submitText: 'Go to Dashboard',
      onSubmit: async () => {
        await goToFiles()
      },
      onClose: async () => {
        await goToFiles()
      },
      withBackButton: false,
    })
  }

  const onSubmitClick = async () => {
    await withLocationLoading(
      async () => {
        const savedContent = await saveCurrentContent()
        const tokenId = data.tokenId ?? (await activateContent(savedContent))

        await saveTokenMetadata({ ...savedContent, tokenId })
        openSuccessModal()
      },
      'Error updating listing:',
      'Failed to update listing.',
    )
  }
</script>

<div class="min-h-xl rounded-3xl p-5 shadow-md md:p-10 bg-[#f8f5f1]">
  <UploadStepHeader {currentStep} />

  {#if currentStep === 1}
    <UploadLocationStep bind:currentStep onSaveDraft={!data.tokenId ? onSaveDraftClick : undefined} />
  {:else if currentStep === 2}
    <UploadLicensingStep bind:currentStep onSaveDraft={!data.tokenId ? onSaveDraftClick : undefined} />
  {:else}
    <ConfirmLocationStep
      bind:currentStep
      onFormSubmit={onSubmitClick}
      onSaveDraft={!data.tokenId ? onSaveDraftClick : undefined}
    />
  {/if}
</div>
