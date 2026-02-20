<script lang="ts">
  import { agencyStore } from '$lib/stores/agency.svelte'

  let addressTouched = $state(false)

  function handleAddressChange() {
    addressTouched = true
  }
</script>

<div class="w-full">
  <label for="agency-address" class="block text-sm text-gray-700 mb-2">Agency Address</label>
  <input
    id="agency-address"
    type="text"
    bind:value={agencyStore.agencyAddress}
    onchange={handleAddressChange}
    placeholder="Enter agency address (0x...)"
    class="w-full px-4 py-3 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none transition-colors {!addressTouched || agencyStore.isValidAddress ? 'border-gray-300 focus:border-gray-900' : 'border-red-500 focus:border-red-600'}"
  />
  {#if addressTouched && !agencyStore.isValidAddress}
    <p class="text-sm text-red-500 mt-1">Invalid Ethereum address</p>
  {/if}
</div>
