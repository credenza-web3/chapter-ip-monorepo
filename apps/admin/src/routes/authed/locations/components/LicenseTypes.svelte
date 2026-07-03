<script lang="ts">
  import { LICENSE_TYPES } from '../constants/constants'
  import { locationStore } from '../stores/location-store'
  import Toggle from './Toggle.svelte'

  const MIN_PRICE = 0.5

  const isPriceTooLow = (value: string) => value !== '' && Number(value) < MIN_PRICE
</script>

<div class="space-y-4">
  <div>
    <p class="text-sm font-medium text-[#747474]">A minimum of one must be selected</p>
    <h3 class="text-base font-semibold text-[#1A1A2E]">License types <span class="text-[#ff0000]">*</span></h3>
  </div>

  <div class="space-y-4">
    {#each LICENSE_TYPES as license (license.id)}
      <div class="flex items-start justify-between gap-4">
        <div class="md:mt-2">
          <Toggle
            checked={$locationStore.licensing.licenseTypes[license.id]}
            onToggle={() =>
              locationStore.setLicenseTypeEnabled(license.id, !$locationStore.licensing.licenseTypes[license.id])}
          />
        </div>

        <div class="flex flex-col w-full">
          <div class="flex items-center gap-3 flex-row justify-between">
            <p class="text-sm font-semibold text-[#1A1A2E]">{license.label}</p>

            <div
              class="flex items-center gap-0.5 shrink-0 text-[#30364b] transition-opacity"
              class:opacity-100={$locationStore.licensing.licenseTypes[license.id]}
              class:opacity-40={!$locationStore.licensing.licenseTypes[license.id]}
              class:pointer-events-none={!$locationStore.licensing.licenseTypes[license.id]}
            >
              <div class="flex flex-col gap-1">
                <div class="flex items-center border border-[#ddd4cc] rounded-sm bg-white overflow-hidden text-sm">
                  <span class="px-2">$</span>
                  <input
                    type="number"
                    min="0.5"
                    value={$locationStore.licensing.licensePrices[license.id]}
                    oninput={(e) => locationStore.setLicenseTypePrice(license.id, e.currentTarget.value)}
                    onblur={(e) => {
                      const val = e.currentTarget.value
                      if (val !== '' && Number(val) < MIN_PRICE) {
                        e.currentTarget.value = String(MIN_PRICE)
                        locationStore.setLicenseTypePrice(license.id, String(MIN_PRICE))
                      }
                    }}
                    onwheel={(e) => e.preventDefault()}
                    placeholder="USD"
                    class="flex-1 h-10.5 w-20 font-medium focus:outline-none pr-2"
                  />
                  <span class="px-2 h-full">USD</span>
                </div>

                {#if $locationStore.licensing.licenseTypes[license.id] && ($locationStore.licensing.licensePrices[license.id] === '' || isPriceTooLow($locationStore.licensing.licensePrices[license.id]))}
                  <p class="text-xs font-medium text-red-600">Minimum price is $0.50</p>
                {/if}
              </div>
            </div>
          </div>
          <p class="text-xs text-[#71707a] mt-1 max-w-md">{license.description}</p>
        </div>
      </div>
    {/each}
  </div>
</div>
