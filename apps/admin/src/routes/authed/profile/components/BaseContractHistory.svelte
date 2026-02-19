<script lang="ts">
  import { ethers, initProvider } from '@repo/fe-evm-provider'
  import { authStore } from '$lib/auth'
  import { onMount } from 'svelte'
  import { fetchUntilFound, getAmount } from './helper'

  const { userAddress, contractAddress, abi } = $props()

  let isLoading = $state(false)
  let events = $state<any[]>([])

  const STEP = 50_000
  let rpcProvider
  let contract: ethers.Contract
  let currentFromBlock: number
  let latestBlock: number
  let stopLoading = $state(false)

  async function loadUntilFound() {
    if (isLoading) return
    if (!currentFromBlock || currentFromBlock <= 0) return

    isLoading = true
    stopLoading = false

    try {
      const result = await fetchUntilFound(contract, userAddress, currentFromBlock, STEP, () => stopLoading)
      events = [...events, ...result.foundEvents]
      currentFromBlock = result.nextBlock
    } catch (e) {
      console.error(e)
    } finally {
      isLoading = false
    }
  }

  onMount(async () => {
    const provider = await initProvider(authStore.state.accessToken!)
    rpcProvider = await provider.getRpcProvider()

    latestBlock = await rpcProvider.getBlockNumber()
    currentFromBlock = latestBlock

    contract = new ethers.Contract(contractAddress, abi, rpcProvider)

    await loadUntilFound()
  })
</script>

<div class="space-y-4">
  {#if events.length > 0}
    <div class="overflow-x-auto w-full">
      <table class="table table-zebra w-full text-sm">
        <thead>
          <tr>
            <th>Event</th>
            <th>Tx Hash</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {#each events as event}
            <tr>
              <td>{event.fragment?.name}</td>
              <td class="break-all">{event.transactionHash}</td>
              <td>
                {contractAddress === import.meta.env.VITE_EVM_CRED_CONTRACT_ADDRESS
                  ? ethers.formatUnits(getAmount(event.args), 6)
                  : getAmount(event.args)}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}

  <button
    class="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
    onclick={loadUntilFound}
    disabled={isLoading}
  >
    {isLoading ? 'Loading...' : 'Load more'}
  </button>

  <button
    class="px-4 py-2 bg-red-700 text-white rounded"
    onclick={() => (stopLoading = true)}
    class:hidden={stopLoading || !isLoading}
  >
    Stop
  </button>

  <div class="text-sm text-gray-500">
    Loaded events: {events.length}
  </div>
</div>
