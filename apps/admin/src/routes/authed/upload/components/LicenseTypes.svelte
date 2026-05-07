<script lang="ts">
  import { LICENSE_TYPES } from '../constants/constants'
  import { uploadStore } from '../stores/upload-store'
  import Toggle from './Toggle.svelte'
</script>

<div class="space-y-4">
  <div>
    <p class="text-sm font-medium text-[#747474]">A minimum of one must be selected</p>
    <h3 class="text-base font-semibold text-[#1A1A2E]">License types<span class="text-[#ff0000]">*</span></h3>
  </div>

  <div class="space-y-4">
    {#each LICENSE_TYPES as license (license.id)}
      <div class="flex items-start justify-between gap-4">
        <div class="md:mt-2">
          <Toggle
            checked={$uploadStore.licensing.licenseTypes[license.id]}
            onToggle={() =>
              uploadStore.setLicenseTypeEnabled(license.id, !$uploadStore.licensing.licenseTypes[license.id])}
          />
        </div>

        <div class="flex flex-col w-full">
          <div class="flex flex-col items-start md:items-center gap-3 md:flex-row justify-between md:h-10.5">
            <p class="text-sm font-semibold text-[#1A1A2E]">{license.label}</p>

            <div
              class="flex items-center gap-0.5 shrink-0 text-[#30364b] transition-opacity"
              class:opacity-100={$uploadStore.licensing.licenseTypes[license.id]}
              class:opacity-40={!$uploadStore.licensing.licenseTypes[license.id]}
              class:pointer-events-none={!$uploadStore.licensing.licenseTypes[license.id]}
            >
              <div class="flex items-center border border-[#ddd4cc] rounded-sm bg-white overflow-hidden text-sm">
                <span class="px-2">$</span>
                <input
                  type="text"
                  value={$uploadStore.licensing.licensePrices[license.id]}
                  oninput={(e) => uploadStore.setLicenseTypePrice(license.id, e.currentTarget.value)}
                  placeholder="USD"
                  class="flex-1 h-10.5 w-20 font-medium focus:outline-none pr-2"
                />
                <span class="px-2 h-full">USD</span>
              </div>

              {#if license.hasDropdown && license.dropdownOptions}
                <select
                  value={$uploadStore.licensing.licenseDropdowns[license.id]}
                  onchange={(e) => uploadStore.setLicenseTypeDropdown(license.id, e.currentTarget.value)}
                  class="select h-10.5 w-31.25 border border-[#ddd4cc] rounded-sm bg-white px-2 text-sm text-[#1A1A2E] focus:outline-none focus:border-primary"
                >
                  {#each license.dropdownOptions as opt (opt)}
                    <option value={opt}>{opt}</option>
                  {/each}
                </select>
              {/if}
            </div>
          </div>
          <p class="text-xs text-[#71707a] mt-1 max-w-md">{license.description}</p>
        </div>
      </div>
    {/each}
  </div>
</div>
