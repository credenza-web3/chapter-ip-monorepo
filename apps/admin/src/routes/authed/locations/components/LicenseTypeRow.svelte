<script lang="ts">
  import { locationStore } from '../stores/location-store'
  import Toggle from './Toggle.svelte'

  const MIN_PRICE = 0.5

  type LicenseType = {
    id: string
    label: string
    description: string
  }

  let { license }: { license: LicenseType } = $props()

  const isEnabled = $derived($locationStore.licensing.licenseTypes[license.id])
  const priceSuffix = $derived(license.id === 'perpetual' ? 'USD/MO' : 'USD')

  const isPriceTooLow = (value: string) => value !== '' && Number(value) < MIN_PRICE
</script>

<div class="flex items-start justify-between gap-4">
  <div class="md:mt-2">
    <Toggle checked={isEnabled} onToggle={() => locationStore.setLicenseTypeEnabled(license.id, !isEnabled)} />
  </div>

  <div class="flex flex-col w-full">
    <div class="flex items-center gap-3 flex-row justify-between">
      <p class="text-sm font-semibold text-dark">{license.label}</p>

      <div
        class="flex items-center gap-0.5 shrink-0 text-[#30364b] transition-opacity"
        class:opacity-100={isEnabled}
        class:opacity-40={!isEnabled}
        class:pointer-events-none={!isEnabled}
      >
        <div class="flex items-center border border-[#ddd] rounded-sm bg-white overflow-hidden text-sm">
          <span class="px-2 text-[#30364b]">$</span>
          <input
            type="text"
            inputmode="numeric"
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
            placeholder={license.id === 'perpetual' ? '5,000' : '2,000'}
            class="flex-1 h-10.5 w-20 font-medium focus:outline-none pr-2 text-[#30364b]"
          />
          <span class="px-2 text-[10px] text-[#30364b]/50 whitespace-nowrap">{priceSuffix}</span>
        </div>

        {#if isEnabled && ($locationStore.licensing.licensePrices[license.id] === '' || isPriceTooLow($locationStore.licensing.licensePrices[license.id]))}
          <p class="text-xs font-medium text-red-600">Minimum price is $0.50</p>
        {/if}
      </div>
    </div>
    <p class="text-xs text-[#71707a] mt-1 max-w-md">{license.description}</p>
  </div>
</div>
