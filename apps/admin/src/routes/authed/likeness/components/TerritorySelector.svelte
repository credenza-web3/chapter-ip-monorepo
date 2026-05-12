<script lang="ts">
  import { TERRITORIES } from '../constants/constants'
  import { likenessStore } from '../stores/likeness-store'

  function toggleTerritory(territory: string) {
    if (territory === 'Select all') {
      likenessStore.setTerritories(
        $likenessStore.licensing.territories.length === TERRITORIES.length - 1
          ? []
          : TERRITORIES.filter((item) => item !== 'Select all'),
      )
      return
    }

    if ($likenessStore.licensing.territories.includes(territory)) {
      likenessStore.setTerritories($likenessStore.licensing.territories.filter((t) => t !== territory))
    } else {
      likenessStore.setTerritories([...$likenessStore.licensing.territories, territory])
    }
  }

  function isSelected(territory: string) {
    return territory === 'Select all'
      ? $likenessStore.licensing.territories.length === TERRITORIES.length - 1
      : $likenessStore.licensing.territories.includes(territory)
  }
</script>

<div class="space-y-4">
  <div>
    <p class="text-xs text-[#71707a]">A minimum of one must be selected</p>
    <h3 class="text-base font-semibold text-[#1A1A2E]">Territory<span class="text-[#ff0000]">*</span></h3>
  </div>
  <div class="flex flex-wrap gap-2">
    {#each TERRITORIES as territory (territory)}
      <button
        type="button"
        onclick={() => toggleTerritory(territory)}
        class={`flex items-center gap-1.5 px-5 py-1.5 rounded-full border text-sm transition-colors ${
          isSelected(territory)
            ? 'bg-primary text-white border-primary'
            : 'bg-white text-[#1A1A2E] border-[#ddd4cc] hover:border-primary'
        }`}
      >
        {#if isSelected(territory)}
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path
              d="M1 4L3.5 6.5L9 1"
              stroke="white"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        {:else}
          <span class="text-base text-[#71707a]">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" class="text-[#71707a]">
              <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            </svg>
          </span>
        {/if}
        {territory}
      </button>
    {/each}
  </div>
</div>
