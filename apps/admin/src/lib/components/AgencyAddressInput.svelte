<script lang="ts">
  let agencyAddress = $state('')
  let agencyPercentage = $state('')
  
  function saveData() {
    if (!agencyAddress) {
      console.log('Agency address is empty')
      throw new Error('Agency address is empty')
    }
    if (!agencyPercentage) {
      console.log('Agency percentage is empty')
      throw new Error('Agency percentage is empty')
    }
    console.log('Saving agency address:', agencyAddress)
    console.log('Saving agency percentage:', agencyPercentage)
    // TODO: Add actual save logic here
  }
  
  // Load data from blockchain (mock for now)
  async function loadFromBlockchain() {
    // TODO: Replace with actual blockchain call
    console.log('Loading agency data from blockchain...')
    
    // Mock data
    const mockData = {
      address: '0x1234567890123456789012345678901234567890',
      percentage: '15.5'
    }
    
    agencyAddress = mockData.address
    agencyPercentage = mockData.percentage
    
    console.log('Loaded agency data:', mockData)
    return mockData
  }
  
  // Export methods for parent component
  export { saveData }
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

<div class="mt-4">
  <label for="agency-percentage" class="block text-sm text-gray-700 mb-2">Agency Share Percentage</label>
  <input
    id="agency-percentage"
    type="number"
    bind:value={agencyPercentage}
    placeholder="Enter agency share percentage"
    min="0"
    max="100"
    step="0.01"
    class="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 transition-colors"
  />
</div>
