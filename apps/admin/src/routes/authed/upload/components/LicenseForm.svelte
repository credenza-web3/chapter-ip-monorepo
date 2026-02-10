<script lang="ts">
  import { uploadStore } from '../stores/upload-store'

  function handleLifetimeChange(e: Event) {
    const target = e.target as HTMLInputElement
    if (target) uploadStore.setLifetimeLicense(target.checked)
  }

  function handleOneTimeChange(e: Event) {
    const target = e.target as HTMLInputElement
    if (target) uploadStore.setOneTimeLicense(target.checked)
  }

  function handleLifetimePriceChange(e: Event) {
    const target = e.target as HTMLInputElement
    if (target) uploadStore.setLifetimePrice(Number(target.value))
  }

  function handleOneTimePriceChange(e: Event) {
    const target = e.target as HTMLInputElement
    if (target) uploadStore.setOneTimePrice(Number(target.value))
  }
</script>

<fieldset class="fieldset bg-base-100 rounded-box border p-4 max-w-lg">
  <legend class="fieldset-legend"
    >Choose License Type <span class="text-[10px] opacity-50">(set license prices in (USD))</span></legend
  >
  <label class="label justify-between">
    <div class="space-x-2">
      <input 
        type="checkbox" 
        checked={$uploadStore.isLifetimeLicense} 
        onchange={handleLifetimeChange}
        class="checkbox" 
      />
      <span class="label-text">Lifetime License (USD)</span>
    </div>
    {#if $uploadStore.isLifetimeLicense}
      <input
        type="number"
        class="input validator max-w-xs"
        required
        placeholder="Enter the price in (USD)."
        min="1"
        value={$uploadStore.lifetimePrice}
        oninput={handleLifetimePriceChange}
      />
    {/if}
  </label>
  <label class="label justify-between">
    <div class="space-x-2">
      <input 
        type="checkbox" 
        checked={$uploadStore.isOneTimeLicense} 
        onchange={handleOneTimeChange}
        class="checkbox" 
      />
      <span class="label-text">One Time License (USD)</span>
    </div>

    {#if $uploadStore.isOneTimeLicense}
      <input
        type="number"
        class="input validator max-w-xs"
        required
        placeholder="Enter the price in (USD)."
        min="1"
        value={$uploadStore.oneTimePrice}
        oninput={handleOneTimePriceChange}
      />
    {/if}
  </label>
</fieldset>
