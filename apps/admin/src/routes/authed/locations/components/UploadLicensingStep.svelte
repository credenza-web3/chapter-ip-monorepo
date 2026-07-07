<script lang="ts">
  import { locationStore, isFormValid } from '../stores/location-store'
  import { LICENSE_TYPES } from '../constants/constants'
  import LicenseTypeRow from './LicenseTypeRow.svelte'

  let {
    currentStep = $bindable(),
    onSaveDraft,
  }: {
    currentStep: number
    onSaveDraft?: () => Promise<void>
  } = $props()

  const primaryLocationFile = $derived($locationStore.files.locations)

  function toggleAgreement() {
    locationStore.setAgreedToFee(!$locationStore.licensing.agreedToFee)
  }

  const canContinueFromStepTwo = $derived(
    Boolean(!$locationStore.ui.loading && primaryLocationFile && $locationStore.licensing.agreedToFee),
  )
</script>

<div class="space-y-12 mt-7.25 text-dark">
  <!-- Title Section -->
  <div>
    <h2 class="mb-2 text-[28px] font-medium text-left text-dark font-heading">Licensing</h2>
    <p class="mt-3 text-base text-[#72717b]">
      Set how creators can license this location. Pick at least one and name your price. Royalties route to you.
    </p>
  </div>

  <!-- License Types -->
  <div class="space-y-4">
    <p class="text-sm font-medium text-[#747474]">A minimum of one must be selected</p>
    <h3 class="text-base font-semibold text-dark font-heading">License types <span class="text-[#ff0000]">*</span></h3>

    <div class="space-y-6">
      {#each LICENSE_TYPES.filter((l) => l.id !== 'perpetual') as license (license.id)}
        <LicenseTypeRow {license} />
      {/each}
    </div>
  </div>

  <!-- Fee Agreement -->
  <div class="flex justify-center">
    <label class="flex items-center gap-3 cursor-pointer">
      <button
        type="button"
        onclick={toggleAgreement}
        class="w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors
          {$locationStore.licensing.agreedToFee ? 'bg-primary border-primary' : 'border-[#ddd] bg-white'}"
      >
        {#if $locationStore.licensing.agreedToFee}
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path
              d="M1 4L3.5 6.5L9 1"
              stroke="white"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        {/if}
      </button>
      <span class="text-sm text-[#71707a]">
        I am aware and consent to ChapterIP adding a 3% transaction fee on all sales.
        <span class="text-[#ff0000]">*</span>
      </span>
    </label>
  </div>
</div>

<!-- Buttons -->
<div class="flex justify-end gap-1.5 mt-12.5">
  {#if onSaveDraft}
    <button
      class="text-sm font-medium rounded-sm h-9.5 px-7.5 bg-cream border border-[#ddd] disabled:bg-[#e1dddb] text-dark cursor-pointer"
      onclick={onSaveDraft}
      disabled={$locationStore.ui.loading}
    >
      Save as Draft
    </button>
  {/if}
  <button
    class="text-sm font-medium rounded-sm h-9.5 px-7.5 bg-primary disabled:bg-[#e1dddb] text-cream cursor-pointer"
    onclick={() => (currentStep = 1)}
    disabled={$locationStore.ui.loading}
  >
    Go back
  </button>
  {#if $isFormValid}
    <button
      class="text-sm font-medium rounded-sm h-9.5 px-7.5 bg-primary disabled:bg-[#e1dddb] text-cream cursor-pointer"
      onclick={() => (currentStep = 3)}
      disabled={!canContinueFromStepTwo}
    >
      Save and Continue
    </button>
  {:else}
    <button class="text-sm font-medium rounded-sm h-9.5 px-7.5 bg-[#e1dddb] text-cream cursor-not-allowed" disabled>
      Save and Continue
    </button>
  {/if}
</div>
