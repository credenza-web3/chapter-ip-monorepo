<script lang="ts">
  let agencyAddress = $state('')
  
  function saveAddress() {
    if (!agencyAddress) {
      console.log('Agency address is empty')
      throw new Error('Agency address is empty')
    }
    console.log('Saving agency address:', agencyAddress)
    // TODO: Add actual save logic here
    return agencyAddress
  }
  
  function setAddress(address: string) {
    agencyAddress = address
  }
  
  // Export methods for parent component
  export { saveAddress, setAddress }
</script>

<div>
  <label for="agency-address" class="block text-sm text-gray-700 mb-2">Agency Address</label>
  <input
    id="agency-address"
    type="text"
    bind:value={agencyAddress}
    placeholder="Enter agency address"
    class="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 transition-colors"
  />
</div>
