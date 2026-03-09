<script lang="ts">
  import { uploadStore } from '../stores/upload-store'
  import LicenceInput from './LicenceInput.svelte'

  function handleLifetimePriceChange(e: Event) {
    const target = e.target as HTMLInputElement
    if (target) uploadStore.setLifetimePrice(Number(target.value))
  }

  function handleOneTimePriceChange(e: Event) {
    const target = e.target as HTMLInputElement
    if (target) uploadStore.setOneTimePrice(Number(target.value))
  }
</script>

<fieldset class="fieldset bg-base-100 rounded-box p-4 max-w-lg">
  <legend class="fieldset-legend">Choose license type and pricing</legend>
  <label class="label justify-between cursor-pointer">
    <div class="space-x-2 flex items-center">
      <LicenceInput bind:checked={$uploadStore.isLifetimeLicense} />
      <span class="font-medium text-xs text-black">Lifetime License</span>
    </div>

    <div
      class="inline-flex items-center py-2.5 pr-2 pl-3 rounded-mb border border-gray-200 bg-gray-50 transition-all duration-200 w-20"
    >
      <input
        type="number"
        value={$uploadStore.lifetimePrice}
        oninput={handleLifetimePriceChange}
        disabled={!$uploadStore.isLifetimeLicense}
        placeholder="100"
        class="bg-transparent border-none outline-none w-full text-sm placeholder-gray-300"
      />
      <span class="text-[10px] font-medium text-gray-400 shrink-0 select-none">
        USD
      </span>
    </div>
  </label>
  <label class="label justify-between">
    <div class="space-x-2 flex items-center">
      <LicenceInput bind:checked={$uploadStore.isOneTimeLicense} />
      <span class="font-medium text-xs text-black">One Time License</span>
    </div>
    <div
      class="inline-flex items-center py-2.5 pr-2 pl-3 rounded-mb border border-gray-200 bg-gray-50 transition-all duration-200 w-20"
    >
      <input
        type="number"
        value={$uploadStore.oneTimePrice}
        oninput={handleOneTimePriceChange}
        placeholder="100"
        class="bg-transparent border-none outline-none w-full text-sm placeholder-gray-300"
        disabled={!$uploadStore.isOneTimeLicense}
      />
      <span class="text-[10px] font-medium text-gray-400 shrink-0 select-none">
        USD
      </span>
    </div> 
  </label>
</fieldset>
