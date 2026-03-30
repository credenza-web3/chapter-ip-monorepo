<script lang="ts">
  import { uploadStore } from '../stores/upload-store'
  import LicenceInput from './LicenceInput.svelte'

  function handleLifetimePriceChange(e: Event) {
    const target = e.target as HTMLInputElement
    if (!target) return
    if (target.value === '') return
    const value = Math.max(1, Number(target.value))
    target.value = String(value)
    uploadStore.setLifetimePrice(value)
  }

  function handleOneTimePriceChange(e: Event) {
    const target = e.target as HTMLInputElement
    if (!target) return
    if (target.value === '') return
    const value = Math.max(1, Number(target.value))
    target.value = String(value)
    uploadStore.setOneTimePrice(value)
  }
</script>

<fieldset class="fieldset bg-base-100 rounded-box p-4 max-w-md">
  <legend class="fieldset-legend">Choose license type and pricing</legend>
  <div class="label justify-between">
    <label class="space-x-2 flex items-center cursor-pointer">
      <LicenceInput bind:checked={$uploadStore.isLifetimeLicense} />
      <span class="font-medium text-xs text-black">Lifetime License</span>
    </label>
    <div
      class="inline-flex items-center py-2.5 pr-2 pl-3 rounded border border-gray-200 bg-gray-50 transition-all duration-200 max-w-30 md:max-w-none"
      class:opacity-40={!$uploadStore.isLifetimeLicense}
    >
      <input
        type="number"
        bind:value={$uploadStore.lifetimePrice}
        oninput={handleLifetimePriceChange}
        disabled={!$uploadStore.isLifetimeLicense}
        placeholder="100"
        min="1"
        class="bg-transparent border-none outline-none w-full text-sm placeholder-gray-300"
      />
      <span class="text-[10px] font-medium text-gray-400 shrink-0 select-none"> USD </span>
    </div>
  </div>
  <div class="label justify-between">
    <label class="space-x-2 flex items-center cursor-pointer">
      <LicenceInput bind:checked={$uploadStore.isOneTimeLicense} />
      <span class="font-medium text-xs text-black">One Time License</span>
    </label>
    <div
      class="inline-flex items-center py-2.5 pr-2 pl-3 rounded border border-gray-200 bg-gray-50 transition-all duration-200 max-w-30 md:max-w-none"
      class:opacity-40={!$uploadStore.isOneTimeLicense}
    >
      <input
        type="number"
        bind:value={$uploadStore.oneTimePrice}
        oninput={handleOneTimePriceChange}
        placeholder="100"
        min="1"
        class="bg-transparent outline-none w-full text-sm placeholder-gray-300"
        disabled={!$uploadStore.isOneTimeLicense}
      />
      <span class="text-[10px] font-medium text-gray-400 shrink-0 select-none"> USD </span>
    </div>
  </div>
</fieldset>
