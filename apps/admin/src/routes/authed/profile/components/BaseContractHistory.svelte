<script lang="ts">
  import { ethers, initProvider } from '@repo/fe-evm-provider'
  import { authStore } from '$lib/auth'
  import { onMount } from 'svelte'
  import { fetchUntilFound, getAmount, mapLicenseType } from './helper'
  import { HistoryTabs } from '../types'

  const { userAddress, contractAddress, abi, activeTab = '' } = $props()

  let isLoading = $state(false)
  let events = $state<any[]>([])

  const STEP = 45_000

  let rpcProvider: ethers.JsonRpcProvider | null = null
  let contract: ethers.Contract | null = null
  let currentFromBlock: number = 0
  let latestBlock: number = 0
  let stopLoading = $state(false)

  async function loadUntilFound() {
    if (isLoading) return
    if (!currentFromBlock || currentFromBlock <= 0) return
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
          const tokenId = event?.args?.[2]

          let date = '-'
          let licenseTypeLabel: string | undefined = undefined

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
          if (activeTab === HistoryTabs.LICENSES_NFT && tokenId !== undefined && contract) {
            try {
              const licenseType: bigint = await contract.getTokenLicenseType(tokenId)
              licenseTypeLabel = mapLicenseType(licenseType)
            } catch (e) {
              console.warn('License fetch failed:', e)
            }
          }
          return {
            ...event,
            date,
            licenseType: licenseTypeLabel,
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
    latestBlock = await rpcProvider?.getBlockNumber()
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
            <th>
              {activeTab === HistoryTabs.CONTENT_NFT || activeTab === HistoryTabs.LICENSES_NFT ? 'Token ID' : 'Amount'}
            </th>
            <th>Date</th>
            {#if activeTab === HistoryTabs.LICENSES_NFT}
              <th>License Type</th>
            {/if}
          </tr>
        </thead>
        <tbody>
          {#each events as event}
            <tr>
              <td>
                {activeTab === HistoryTabs.CONTENT_NFT ? 'Create' : event.fragment?.name}
              </td>
              <td class="break-all">{event.transactionHash}</td>
              <td>
                {contractAddress === import.meta.env.VITE_EVM_CRED_CONTRACT_ADDRESS
                  ? ethers.formatUnits(getAmount(event.args), 6)
                  : getAmount(event.args)}
              </td>
              <td>{event.date}</td>
              {#if activeTab === HistoryTabs.LICENSES_NFT}
                <td>{event.licenseType ?? '-'}</td>
              {/if}
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
