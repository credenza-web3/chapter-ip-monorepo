<script lang="ts">
  import { agencyStore } from '$lib/stores/agency.svelte'

  let touched = $state(false)

  function handleChange() {
    touched = true
  }
</script>

<div>
  <label for="agency-address" class="block text-sm text-gray-700 mb-2">Agency Address</label>
  <input
    id="agency-address"
    type="text"
    bind:value={agencyStore.agencyAddress}
    onchange={handleChange}
    placeholder="Enter agency address (0x...)"
    class="w-full px-4 py-3 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none transition-colors {!touched || agencyStore.isValidAddress ? 'border-gray-300 focus:border-gray-900' : 'border-red-500 focus:border-red-600'}"
  />
  {#if touched && !agencyStore.isValidAddress}
    <p class="text-sm text-red-500 mt-1">Invalid Ethereum address</p>
  {/if}
</div>

<!-- <div class="mt-4">
  <label for="agency-fee" class="block text-sm text-gray-700 mb-2">Agency Share Fee</label>
  <input
    id="agency-fee"
    type="number"
    bind:value={agencyStore.agencyFee}
    placeholder="Enter agency share fee"
    min="0"
    max="100"
    step="0.01"
    class="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 transition-colors"
  />
</div> -->
