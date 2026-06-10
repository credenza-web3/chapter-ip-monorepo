<script>
  import { getSigner, initProvider } from '@repo/fe-evm-provider'
  import CredContractHistory from '../profile/components/CredContractHistory.svelte'
  import { authStore } from '$lib'
  import { onMount } from 'svelte'

  let userAddress = $state('')

  onMount(async () => {
    const accessToken = await authStore.getAccessToken()
    if (!accessToken) return
    initProvider(accessToken)
    const signer = await getSigner()
    userAddress = await signer.getAddress()
  })
</script>

<div class="p-10 min-h-xl card bg-base-100 shadow-md rounded-3xl">
  <h2 class="text-2xl font-semibold mb-4">Transactions history</h2>
  {#if userAddress}
    <div class="flex-1 max-w-6xl">
      <CredContractHistory {userAddress} />
    </div>
  {/if}
</div>
