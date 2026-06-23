<script lang="ts">
  import type { LikenessLicense } from './types'

  let {
    licenses,
    selectedLicenseId,
    onSelect,
    onPurchase,
    purchaseDisabled,
    purchasePending,
  }: {
    licenses: LikenessLicense[]
    selectedLicenseId: string
    onSelect: (licenseId: string) => void
    onPurchase: () => void
    purchaseDisabled: boolean
    purchasePending: boolean
  } = $props()

  const selectedLicense = $derived(licenses.find((license) => license.id === selectedLicenseId))
</script>

<section aria-labelledby="licensing-heading">
  <h2 id="licensing-heading" class="font-sans text-base leading-5.25 font-semibold text-[#202225]">Licensing Types</h2>
  {#if licenses.length > 0}
    <div class="mt-6.25 overflow-hidden rounded-xs bg-cream">
      {#each licenses as license, i (license.id)}
        <label
          class={`relative flex min-h-32.75 cursor-pointer gap-2.5 border px-3.75 py-3.5 font-sans transition-colors ${i === 0 ? 'rounded-t-lg' : ''} ${i === 1 ? 'rounded-b-lg' : ''} ${
            selectedLicenseId === license.id ? 'z-10 border-primary bg-[#f8f5f1]' : '-mt-px border-[#1a1a2e1a] bg-cream'
          }`}
        >
          <input
            type="radio"
            name="license"
            value={license.id}
            checked={selectedLicenseId === license.id}
            onchange={() => onSelect(license.id)}
            class="peer sr-only"
          />
          <span
            class={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border bg-[#f8f5f1] ${
              selectedLicenseId === license.id ? 'border-primary' : 'border-[#1a1a2e1a]'
            }`}
            aria-hidden="true"
          >
            <span
              class={`size-2.5 rounded-full bg-primary ${
                selectedLicenseId === license.id ? 'opacity-100' : 'opacity-0'
              }`}
            ></span>
          </span>
          <span class="min-w-0 flex-1">
            <span
              class="flex flex-col gap-1 min-[480px]:flex-row min-[480px]:items-start min-[480px]:justify-between min-[480px]:gap-4"
            >
              <span class="font-semibold leading-5.25 text-[#202225]">{license.name}</span>
              <span class="font-semibold leading-5.25 text-[#202225] min-[480px]:shrink-0">
                ${license.price}{#if license.detail}
                  / {license.detail}{/if}
              </span>
            </span>
            {#if license.description}
              <span class="mt-2 block max-w-112.5 text-sm leading-5.25 font-medium text-[#747474]">
                {license.description}
              </span>
            {/if}
          </span>
        </label>
      {/each}
    </div>
  {:else}
    <p class="mt-2 text-[#747474]">No licensing options are currently available.</p>
  {/if}
</section>

{#if selectedLicense}
  <section aria-label="Purchase summary" class="mt-5.5">
    <p class="flex items-baseline justify-end gap-1 text-right font-sans">
      <span class="text-7 leading-8.5 font-semibold text-dark">${selectedLicense.price}</span>
      <span class="text-xs font-medium text-[#72717b]">USD</span>
    </p>
    <button
      disabled={purchaseDisabled}
      onclick={onPurchase}
      class={`mt-1.75 h-13 w-full rounded-[3px] bg-primary px-5 font-heading text-base font-medium text-cream transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${purchaseDisabled ? 'cursor-not-allowed opacity-50' : 'hover:opacity-90'}`}
    >
      {purchasePending ? 'Processing...' : 'Buy License'}
    </button>
  </section>
{/if}
