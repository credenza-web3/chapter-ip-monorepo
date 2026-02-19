<script lang="ts">
  import AgencyControls from './AgencyControls.svelte'

  let { data } = $props()
</script>

<div class="min-h-xl flex items-center justify-center bg-white p-4 w-full">
  <div class="w-full">
    <div class="mb-12 text-center">
      <h1 class="text-4xl font-light text-gray-900 mb-3">Profile</h1>
      <p class="text-gray-500 text-sm">Manage your profile settings</p>
    </div>

    <div class="flex flex-col gap-6 w-full justify-between">
      <div class="max-w-md">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Your Information</h2>
        
        <div class="bg-gray-50 p-4 rounded-lg mb-6">
          <p class="text-sm text-gray-600 mb-1">Your Address</p>
          <p class="text-sm font-mono text-gray-900 break-all">{data.userAddress}</p>
        </div>
      </div>
      <hr />
      <AgencyControls contentContract={data.contentContract} userAddress={data.userAddress as string} />
      <hr />
      <div class="max-w-md">
         <!-- TODO: implement transactions history and remove cover -->
        <h2 class="text-lg font-medium text-gray-200 mb-4">Your transactions history (in development)</h2>
        
        <div class="bg-gray-200 opacity-10 p-4 rounded-lg mb-6">
          <p class="text-sm text-gray-600 mb-1">TBD</p>
        </div>
      </div>
    </div>
  </div>
</div>
