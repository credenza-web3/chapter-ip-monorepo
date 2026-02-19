<script lang="ts">
  import { agencyStore } from '$lib/stores/agency.svelte'
  let feeTouched = $state(false)

  function handleFeeChange() {
    feeTouched = true
  }
</script>

<div class="w-full">
  <label for="agency-fee" class="block text-sm text-gray-700 mb-2">Agency Share Fee</label>
  <input
    id="agency-fee"
    type="number"
    bind:value={agencyStore.agencyFee}
    onchange={handleFeeChange}
    placeholder="Enter agency share fee"
    min="0"
    max="100"
    step="0.01"
    class="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 transition-colors {!feeTouched || agencyStore.isFeeValid ? 'border-gray-300 focus:border-gray-900' : 'border-red-500 focus:border-red-600'}"
  />
  {#if feeTouched && !agencyStore.isFeeValid}
    <p class="text-sm text-red-500 mt-1">Invalid fee</p>
  {/if}
</div>
