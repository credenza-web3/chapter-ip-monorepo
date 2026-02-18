<script lang="ts">
  import { ethers, initProvider } from '@repo/fe-evm-provider'
  import { authStore } from '$lib/auth/index.js'
  import { abi as cred_abi } from '@credenza3/contracts/artifacts/CredenzaToken.json'
  import { onMount } from 'svelte'

  const { userAddress } = $props<{ userAddress?: string }>()

  const contractAddress = import.meta.env.VITE_EVM_CRED_CONTRACT_ADDRESS
  let isLoading = $state(false)
  let events = $state<any[]>([])

  $inspect(events)

  let rpcProvider: any
  let contract: ethers.Contract

  const STEP = 50_000
  let currentFromBlock: number
  let latestBlock: number
  let stopLoading = $state(false)

  async function loadUntilFound() {
    if (isLoading) return
    if (currentFromBlock <= 0) return

    isLoading = true
    stopLoading = false

    try {
      const filter = contract.filters.Transfer(null, userAddress)
      let found = false

      while (!found && currentFromBlock > 0) {
        if (stopLoading) break

        const toBlock = currentFromBlock
        const fromBlock = Math.max(toBlock - STEP, 0)

        console.log(`Checking blocks ${fromBlock} → ${toBlock}`)

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

    contract = new ethers.Contract(contractAddress, cred_abi, rpcProvider)

    await loadUntilFound()
  })

  function getAmount(args: any) {
    if (!args || args.length < 3) return ''
    const value = args[2]
    return ethers.formatUnits(value, 6)
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
