<script lang="ts">
  import { agencyStore } from '$lib/stores/agency.svelte'

  let addressTouched = $state(false)

  function handleAddressChange() {
    addressTouched = true
  }
</script>

<div class="w-full">
  <label for="agency-address" class="block text-sm mb-2 font-medium">Agency Address</label>
  <input
    id="agency-address"
    type="text"
    bind:value={agencyStore.agencyAddress}
    onchange={handleAddressChange}
    placeholder="Enter agency address (0x...)"
    class="w-full bg-white px-4 py-3 border rounded-md placeholder-gray-400 focus:outline-none
     transition-colors font-medium text-xs text-[#707070] {!addressTouched || agencyStore.isValidAddress
      ? 'border-gray-300 focus:border-gray-900'
      : 'border-red-500 focus:border-red-600'}"
  />
  {#if addressTouched && !agencyStore.isValidAddress}
    <p class="text-sm text-red-500 mt-1">Invalid Ethereum address</p>
  {/if}
</div>
