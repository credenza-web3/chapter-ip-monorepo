<script lang="ts">
  import { afterNavigate, beforeNavigate, goto } from '$app/navigation'
  import { getHeightTotalInches, getNormalizedWeight, likenessStore } from './stores/likeness-store'
  import UploadStepHeader from './components/UploadStepHeader.svelte'
  import UploadLikenessStep from './components/UploadLikenessStep.svelte'
  import UploadLicensingStep from './components/UploadLicensingStep.svelte'
  import ConfirmLikenessStep from './components/ConfirmLikenessStep.svelte'
  import { authStore } from '$lib'
  import UploadService from '$lib/upload/upload.service'
  import TransactionService from '$lib/upload/transaction.service'
  import BlockchainService from '$lib/upload/blockchain.service'
  import { notify, ToastType } from '@repo/ui-components'
  import { modals, type ModalProps } from 'svelte-modals'
  import { ConfirmModal, type TConfirmModalProps } from '@repo/ui-components'
  import {
    createLikenessFileNames,
    LIKENESS_FILE_BUCKETS,
    type MultipleFileKey,
  } from '$lib/constants/likenessFileBuckets'

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

      const uploadsByBucket = LIKENESS_FILE_BUCKETS.reduce(
        (acc, bucket) => {
          acc[bucket] = createLikenessFileNames(bucket, $likenessStore.files[bucket].length)
          return acc
        },
        {} as Record<MultipleFileKey, string[]>,
      )
      const uploads = LIKENESS_FILE_BUCKETS.flatMap((bucket) =>
        $likenessStore.files[bucket].map((file, index) => ({
          file,
          name: uploadsByBucket[bucket][index],
        })),
      )
      const heightTotalInches = getHeightTotalInches($likenessStore.profile.attributes)
      const weight = getNormalizedWeight($likenessStore.profile.attributes.weight)

      const { tokenId, keys } = await uploadService.uploadContent({
        trpcClient,
        uploads,
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
          "Your likeness has been added to Chapter IP. By completing this step, you've transformed your likeness into a secure, licensable digital asset that can be discovered, verified, and managed for future opportunities.",
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
