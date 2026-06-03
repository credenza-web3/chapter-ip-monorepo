<script lang="ts">
  import { afterNavigate, beforeNavigate, goto } from '$app/navigation'
  import { likenessStore } from '../stores/likeness-store'
  import UploadStepHeader from '../components/UploadStepHeader.svelte'
  import UploadLikenessStep from '../components/UploadLikenessStep.svelte'
  import UploadLicensingStep from '../components/UploadLicensingStep.svelte'
  import ConfirmLikenessStep from '../components/ConfirmLikenessStep.svelte'
  import { UploadService } from '$lib'
  import { notify, ToastType } from '@repo/ui-components'
  import { modals, type ModalProps } from 'svelte-modals'
  import { ConfirmModal, type TConfirmModalProps } from '@repo/ui-components'
  import { onDestroy, onMount } from 'svelte'

  let { data } = $props()

  onMount(() => {
    // likenessStore.set(data.content) check content if it fits likenessStore
    //
  })
  onDestroy(() => {
    likenessStore.reset()
  })

  let currentStep = $state(1)
  const uploadService = new UploadService()

  beforeNavigate(() => likenessStore.setLoading(true))
  afterNavigate(() => likenessStore.setLoading(false))

  const onSubmitClick = async () => {
    //
  }
</script>

<div class="min-h-xl rounded-3xl p-5 shadow-md md:p-10 bg-[#f8f5f1]">
  <!-- <UploadStepHeader {currentStep} />

  {#if currentStep === 1}
    <UploadLikenessStep bind:currentStep />
  {:else if currentStep === 2}
    <UploadLicensingStep bind:currentStep />
  {:else}
    <ConfirmLikenessStep bind:currentStep onFormSubmit={onSubmitClick} />
  {/if} -->
</div>
