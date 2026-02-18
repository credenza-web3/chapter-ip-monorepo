<script lang="ts">
  import { ethers, initProvider } from '@repo/fe-evm-provider'
  import { authStore } from '$lib/auth'
  import { onMount } from 'svelte'

  const {
    userAddress,
    contractAddress,
    abi,
    formatAmount,
  }: {
    userAddress?: string
    contractAddress: string
    abi: any
    formatAmount?: (args: any) => string
  } = $props()

  let isLoading = $state(false)
  let events = $state<any[]>([])

  let rpcProvider
  let contract: ethers.Contract

  const STEP = 50_000
  let currentFromBlock: number
  let latestBlock: number
  let stopLoading = $state(false)

  async function loadUntilFound() {
    if (isLoading) return
    if (!currentFromBlock || currentFromBlock <= 0) return

    isLoading = true
    stopLoading = false

    try {
      const filter = contract.filters.Transfer(null, userAddress)
      let found = false

      while (!found && currentFromBlock > 0) {
        if (stopLoading) break

        const toBlock = currentFromBlock
        const fromBlock = Math.max(toBlock - STEP, 0)

        const chunk = await contract.queryFilter(filter, fromBlock, toBlock)

        currentFromBlock = fromBlock - 1

        if (chunk.length > 0) {
          events = [...events, ...chunk]
          found = true
        }
      }
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

  function getAmount(args: any) {
    if (!args || args.length < 3) return ''
    if (formatAmount) return formatAmount(args)

    const value = args[2]
    return typeof value === 'bigint' ? value.toString() : value
  }
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
              <td>{getAmount(event.args)}</td>
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
