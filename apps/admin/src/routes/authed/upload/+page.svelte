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
    Boolean($uploadStore.title.trim() && $uploadStore.description.trim() && $uploadStore.uploaded),
  )

  function goToStep(step: number) {
    currentStep = step
  }

  const onSubmitClick = async () => {
    if (!$uploadStore.uploaded) {
      notify('No file selected', ToastType.FAIL)
      return
    }

    try {
      uploadStore.setLoading(true)
      const trpcClient = uploadService.createTrpcClient()

      const { tokenId, imageUrl, key } = await uploadService.uploadContent(
        $uploadStore.uploaded!,
        $uploadStore.uploadedImage,
        $uploadStore.lifetimePrice,
        $uploadStore.oneTimePrice,
        trpcClient,
      )

      await uploadService.saveMetadata({
        tokenId,
        uploaded: $uploadStore.uploaded!,
        imageUrl,
        key,
        title: $uploadStore.title,
        description: $uploadStore.description,
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

<div class="min-h-xl rounded-[32px] bg-base-100 p-5 shadow-md md:p-10">
  <UploadStepHeader {currentStep} />

  {#if currentStep === 1}
    <UploadLikenessStep />
  {:else}
    <UploadLicensingStep />
  {/if}

  <div class="mt-8 flex flex-col gap-3 border-t border-[#e6dfd8] pt-6 md:flex-row md:justify-between">
    <button
      class="btn h-12 rounded-full border border-[#d8d0c8] bg-white px-6 text-dark hover:bg-[#f7f2ed] disabled:border-[#ece6e1] disabled:bg-[#f7f2ed] disabled:text-[#b6aaa0]"
      onclick={() => goToStep(1)}
      disabled={currentStep === 1 || $uploadStore.loading}
    >
      Back
    </button>

    {#if currentStep === 1}
      <button
        class="btn h-12 rounded-full border-none bg-primary px-6 text-white disabled:bg-[#d9d1ff]"
        onclick={() => goToStep(2)}
        disabled={!canContinueFromStepOne || $uploadStore.loading}
      >
        Continue to licensing
      </button>
    {:else}
      <button
        class="btn h-12 rounded-full border-none bg-primary px-6 text-white disabled:bg-[#d9d1ff]"
        onclick={onSubmitClick}
        disabled={$uploadStore.loading || !$isFormValid || !$uploadStore.uploaded}
      >
        {#if $uploadStore.loading}
          <div class="loading loading-spinner"></div>
        {:else}
          Upload file
        {/if}
      </button>
    {/if}
  </div>
</div>
