<script lang="ts">
  import { afterNavigate, beforeNavigate } from '$app/navigation'
  import { likenessStore } from './stores/likeness-store'
  import UploadStepHeader from './components/UploadStepHeader.svelte'
  import UploadLikenessStep from './components/UploadLikenessStep.svelte'
  import UploadLicensingStep from './components/UploadLicensingStep.svelte'
  import ConfirmLikenessStep from './components/ConfirmLikenessStep.svelte'

  let currentStep = $state(1)

  beforeNavigate(() => likenessStore.setLoading(true))
  afterNavigate(() => likenessStore.setLoading(false))
</script>

<div class="min-h-xl rounded-3xl p-5 shadow-md md:p-10 bg-[#f8f5f1]">
  <UploadStepHeader {currentStep} />

  {#if currentStep === 1}
    <UploadLikenessStep bind:currentStep />
  {:else if currentStep === 2}
    <UploadLicensingStep bind:currentStep />
  {:else}
    <ConfirmLikenessStep bind:currentStep />
  {/if}
</div>
