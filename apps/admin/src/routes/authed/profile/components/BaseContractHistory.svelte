<script lang="ts">
  import { ethers, initProvider } from '@repo/fe-evm-provider'
  import { authStore } from '$lib/auth'
  import { onMount } from 'svelte'
  import { fetchUntilFound, getAmount } from './helper'

  const { userAddress, contractAddress, abi, activeTab = '' } = $props()

  let isLoading = $state(false)
  let events = $state<any[]>([])

  const STEP = 45_000

  let rpcProvider: ethers.JsonRpcProvider | null = null
  let contract: ethers.Contract | null = null
  let currentFromBlock: number = 0
  let stopLoading = $state(false)

  async function loadUntilFound() {
    if (isLoading) return
    if (currentFromBlock <= 0) return
    if (!contract || !rpcProvider) return

    isLoading = true
    stopLoading = false

    try {
      const result = await fetchUntilFound(contract, userAddress, currentFromBlock, STEP, () => stopLoading)
      if (!result?.foundEvents?.length) {
        currentFromBlock = result?.nextBlock ?? 0
        return
      }
      const processed = await Promise.allSettled(
        result.foundEvents.map(async (event: any) => {
          let date = '-'
          try {
            if (event?.blockNumber && rpcProvider) {
              const block = await rpcProvider.getBlock(event.blockNumber)
              if (block?.timestamp) {
                date = new Date(block.timestamp * 1000).toLocaleString()
              }
            }
          } catch (e) {
            console.warn('Block fetch failed:', e)
          }

          return {
            ...event,
            date,
          }
        }),
      )
      const safeEvents = processed.filter((r) => r.status === 'fulfilled').map((r: any) => r.value)

      events = [...events, ...safeEvents]
      currentFromBlock = result.nextBlock ?? 0
    } catch (e) {
      console.error('loadUntilFound error:', e)
    } finally {
      isLoading = false
    }
  }

  onMount(async () => {
    const provider = await initProvider(authStore.state.accessToken!)
    rpcProvider = await provider.getRpcProvider()
    currentFromBlock = (await rpcProvider?.getBlockNumber()) ?? 0
    contract = new ethers.Contract(contractAddress, abi, rpcProvider)
    await loadUntilFound()
  })
</script>

<div class="space-y-4">
  {#if events.length > 0}
    <div class="overflow-x-auto w-full">
      <table class="table table-zebra w-full text-sm ">
        <thead>
          <tr>
            <th>Event</th>
            <th>Tx Hash</th>
            <th>Amount</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {#each events as event (event.transactionHash)}
            <tr>
              <td>
                {event.fragment?.name}
              </td>
              <td>{event.transactionHash}</td>
              <td>
                {ethers.formatUnits(getAmount(event.args), 6)}
              </td>
              <td>{event.date}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}

  <button
    class="px-4 py-2 bg-[#6F4EF7] text-white rounded disabled:opacity-50"
    onclick={loadUntilFound}
    disabled={isLoading}
  >
    {isLoading ? 'Loading...' : 'Load more'}
  </button>

  <button
    class="px-4 py-2 border border-red-600 rounded text-red-600"
    onclick={() => (stopLoading = true)}
    class:hidden={stopLoading || !isLoading}
  >
    Stop
  </button>

  <div class="text-sm text-gray-500">
    Loaded events: {events.length}
  </div>
</div>
