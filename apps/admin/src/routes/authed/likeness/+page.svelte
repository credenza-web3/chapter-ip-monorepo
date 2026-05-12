<script lang="ts">
  import { afterNavigate, beforeNavigate, goto } from '$app/navigation'
  import { isFormValid, likenessStore } from './stores/likeness-store'
  import UploadStepHeader from './components/UploadStepHeader.svelte'
  import UploadLikenessStep from './components/UploadLikenessStep.svelte'
  import UploadLicensingStep from './components/UploadLicensingStep.svelte'

   let { data } = $props()
   console.log('Likeness page data:', data) 

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
    console.log($likenessStore, 'Submitting likeness with data')
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
