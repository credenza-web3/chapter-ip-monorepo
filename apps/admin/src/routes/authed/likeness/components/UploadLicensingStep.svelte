<script lang="ts">
  import { likenessStore } from '../stores/likeness-store'
  import ApprovalSettings from './ApprovalSettings.svelte'
  import LicenseTypes from './LicenseTypes.svelte'
  import PermittedUses from './PermittedUses.svelte'
  import TerritorySelector from './TerritorySelector.svelte'

  function toggleAgreement() {
    likenessStore.setAgreedToFee(!$likenessStore.licensing.agreedToFee)
  }
</script>

{#snippet divider(className = '')}
  <div class={`border-t border-dashed border-[#ddd4cc] ${className}`}></div>
{/snippet}

<div class="space-y-12 mt-7.25 text-dark">
  <div class="pb-6">
    <h2 class="mb-2 text-[28px] font-medium text-left text-dark">Licensing</h2>

    <p class="mt-3 text-base text-[#72717b]">
      Set licensing terms, permitted uses, territory, and approvals for this likeness before continuing.
    </p>
  </div>

  <LicenseTypes />
  {@render divider('mx-10')}
  <PermittedUses />
  {@render divider()}
  <TerritorySelector />
  {@render divider()}
  <ApprovalSettings />
  {@render divider()}

  <div class="flex justify-center">
    <label class="flex items-center gap-3 cursor-pointer">
      <button
        type="button"
        onclick={toggleAgreement}
        class={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
          $likenessStore.licensing.agreedToFee ? 'bg-primary border-primary' : 'border-[#ddd4cc] bg-white'
        }`}
      >
        {#if $likenessStore.licensing.agreedToFee}
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
