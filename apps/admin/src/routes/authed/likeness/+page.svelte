<script lang="ts">
  import { afterNavigate, beforeNavigate, goto } from '$app/navigation'
  import { notify, ToastType } from '@repo/ui-components'
  import { UploadService } from '../upload/services/upload.service'
  import { isFormValid, likenessStore } from './stores/likeness-store'
  import UploadStepHeader from './components/UploadStepHeader.svelte'
  import UploadLikenessStep from './components/UploadLikenessStep.svelte'
  import UploadLicensingStep from './components/UploadLicensingStep.svelte'

  const uploadService = new UploadService()
  let currentStep = $state(1)
  const primaryLikenessFile = $derived($likenessStore.files.headshots ?? $likenessStore.files.source)

  beforeNavigate(() => likenessStore.setLoading(true))
  afterNavigate(() => likenessStore.setLoading(false))

  const canContinueFromStepOne = $derived(
    Boolean(
      $likenessStore.profile.fullLegalName.trim() &&
      $likenessStore.profile.bio.trim() &&
      $likenessStore.files.headshots &&
      $likenessStore.confirmations.rightsConfirmed,
    ),
  )

  function onSaveDraftClick() {
    goto('/authed/files')
  }

  function onSaveLicensingDraftClick() {
    goto('/authed/files')
  }

  function goToStep(step: number) {
    currentStep = step
  }

  const onSubmitClick = async () => {
    if (!primaryLikenessFile) {
      notify('No likeness asset selected', ToastType.FAIL)
      return
    }

    if (!$likenessStore.confirmations.rightsConfirmed) {
      notify('Please confirm that you have the legal right to license this content.', ToastType.FAIL)
      return
    }

    try {
      likenessStore.setLoading(true)
      const trpcClient = uploadService.createTrpcClient()

      const { tokenId, imageUrl, key } = await uploadService.uploadContent(
        primaryLikenessFile!,
        $likenessStore.files.headshots ?? $likenessStore.files.preview,
        $likenessStore.licensing.lifetimePrice,
        $likenessStore.licensing.oneTimePrice,
        trpcClient,
      )

      await uploadService.saveMetadata({
        tokenId,
        uploaded: primaryLikenessFile!,
        imageUrl,
        key,
        title: $likenessStore.profile.fullLegalName,
        description: $likenessStore.profile.bio,
        trpcClient,
      })

      notify('File uploaded successfully', ToastType.SUCCESS)
      likenessStore.reset()
      goto(`/authed/files`)
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
    <UploadLikenessStep />
  {:else}
    <UploadLicensingStep />
  {/if}

  <div class="flex justify-end gap-1.5 mt-12.5">
    {#if currentStep === 1}
      {#if canContinueFromStepOne}
        <button
          class="text-sm font-medium rounded-sm h-9.5 px-7.5 bg-primary disabled:bg-[#e1dddb] text-cream"
          onclick={onSaveDraftClick}
          disabled={$likenessStore.ui.loading}
        >
          Save as Draft
        </button>

        <button
          class="text-sm font-medium rounded-sm h-9.5 px-7.5 bg-primary disabled:bg-[#e1dddb] text-cream"
          onclick={() => goToStep(2)}
          disabled={$likenessStore.ui.loading}
        >
          Save and Continue
        </button>
      {/if}
    {:else}
      <button
        class="text-sm font-medium rounded-sm h-9.5 px-7.5 bg-primary disabled:bg-[#e1dddb] text-cream"
        onclick={() => goToStep(1)}
        disabled={$likenessStore.ui.loading}
      >
        Go back
      </button>

      {#if $isFormValid}
        <button
          class="text-sm font-medium rounded-sm h-9.5 px-7.5 bg-primary disabled:bg-[#e1dddb] text-cream"
          onclick={onSaveLicensingDraftClick}
          disabled={$likenessStore.ui.loading}
        >
          Save as Draft
        </button>

        <button
          class="text-sm font-medium rounded-sm h-9.5 px-7.5 bg-primary disabled:bg-[#e1dddb] text-cream"
          onclick={onSubmitClick}
          disabled={$likenessStore.ui.loading || !primaryLikenessFile}
        >
          {#if $likenessStore.ui.loading}
            <div class="loading loading-spinner"></div>
          {:else}
            Save and Continue
          {/if}
        </button>
      {/if}
    {/if}
  </div>
</div>
