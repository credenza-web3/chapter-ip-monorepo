<script>
  import CredContractHistory from '../profile/components/CredContractHistory.svelte'

  let { data } = $props()
</script>

<div class="p-10 min-h-xl card bg-base-100 shadow-md rounded-3xl">
  <h2 class="text-2xl font-semibold mb-4">Transactions history</h2>
  <div class="flex-1 max-w-6xl">
    <CredContractHistory userAddress={data.userAddress} />
  </div>
</div>
