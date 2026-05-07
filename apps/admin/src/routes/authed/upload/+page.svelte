<script lang="ts">
  import { afterNavigate, beforeNavigate, goto } from '$app/navigation'
  import { notify, ToastType } from '@repo/ui-components'
  import { UploadService } from './services/upload.service'
  import { uploadStore, isFormValid } from './stores/upload-store'
  import UploadStepHeader from './components/UploadStepHeader.svelte'
  import UploadLikenessStep from './components/UploadLikenessStep.svelte'
  import UploadLicensingStep from './components/UploadLicensingStep.svelte'

  const uploadService = new UploadService()
  let currentStep = $state(1)

  beforeNavigate(() => uploadStore.setLoading(true))
  afterNavigate(() => uploadStore.setLoading(false))

  const canContinueFromStepOne = $derived(
    Boolean(
      $uploadStore.profile.fullLegalName.trim() &&
      $uploadStore.profile.bio.trim() &&
      $uploadStore.files.source &&
      $uploadStore.confirmations.rightsConfirmed,
    ),
  )

  function goToStep(step: number) {
    currentStep = step
  }

  const onSubmitClick = async () => {
    if (!$uploadStore.files.source) {
      notify('No file selected', ToastType.FAIL)
      return
    }

    if (!$uploadStore.confirmations.rightsConfirmed) {
      notify('Please confirm that you have the legal right to license this content.', ToastType.FAIL)
      return
    }

    try {
      uploadStore.setLoading(true)
      const trpcClient = uploadService.createTrpcClient()

      const { tokenId, imageUrl, key } = await uploadService.uploadContent(
        $uploadStore.files.source!,
        $uploadStore.files.preview,
        $uploadStore.licensing.lifetimePrice,
        $uploadStore.licensing.oneTimePrice,
        trpcClient,
      )

      await uploadService.saveMetadata({
        tokenId,
        uploaded: $uploadStore.files.source!,
        imageUrl,
        key,
        title: $uploadStore.profile.fullLegalName,
        description: $uploadStore.profile.bio,
        trpcClient,
      })

      notify('File uploaded successfully', ToastType.SUCCESS)
      uploadStore.reset()
      goto(`/authed/files`)
    } catch (error) {
      console.error('Error uploading file:', error)
      let errorMessage = 'Failed to upload file.'
      if (error instanceof Error && error.message.includes('duplicate key error')) {
        errorMessage = errorMessage + ' This file already exists.'
      }
      notify(errorMessage, ToastType.FAIL)
    } finally {
      uploadStore.setLoading(false)
    }
  }
</script>

<div class="min-h-xl rounded-3xl p-5 shadow-md md:p-10 bg-[#f8f5f1]">
  <UploadStepHeader {currentStep} />

  {#if currentStep === 1}
    <UploadLikenessStep />
  {:else}
    <UploadLicensingStep />
  {/if}

  <div class="flex justify-end gap-1.5 mt-12.5">
    {#if currentStep === 1}
      <button
        class="text-sm font-medium rounded-sm h-9.5 px-7.5 bg-primary disabled:bg-[#e1dddb] text-cream"
        onclick={() => goToStep(2)}
        disabled={!canContinueFromStepOne || $uploadStore.ui.loading}
      >
        Save and Continue
      </button>
    {:else}
      <button
        class="text-sm font-medium rounded-sm h-9.5 px-7.5 bg-primary disabled:bg-[#e1dddb] text-cream"
        onclick={() => goToStep(1)}
        disabled={$uploadStore.ui.loading}
      >
        Go back
      </button>

      <button
        class="text-sm font-medium rounded-sm h-9.5 px-7.5 bg-primary disabled:bg-[#e1dddb] text-cream"
        onclick={onSubmitClick}
        disabled={$uploadStore.ui.loading || !$isFormValid || !$uploadStore.files.source}
      >
        {#if $uploadStore.ui.loading}
          <div class="loading loading-spinner"></div>
        {:else}
          Upload file
        {/if}
      </button>
    {/if}
  </div>
</div>
