<script lang="ts">
  import { goto } from '$app/navigation'
  import { formatDate } from '$lib/services/formatDate.js'
  import { fetchContentTokenMeta } from '@repo/fe-services'
  import RecentFiles from './RecentFiles.svelte'
  import { getFilePricing } from './helper'
  import { useClipboard } from '$lib/hooks/useClipboard.svelte'
  import CopyIcon from '$lib/components/icons/CopyIcon.svelte'
  import DetailsIcon from '$lib/components/icons/DetailsIcon.svelte'

  let { data } = $props()
  let { items, contentContract } = data.paginatedResponse

  const openFile = (id: string) => {
    goto(`/authed/files/${id}`)
  }

  const { copyToClipboard } = useClipboard()
</script>

<RecentFiles />

<div class="min-h-xl p-8 border border-[#eef2f6] rounded-3xl bg-white">
  <h2 class="text-2xl font-semibold mb-2.5">Welcome to the Creator Dashboard</h2>
  <p class="text-base font-medium text-[#747474] mb-4">
    Add and manage files, metadata, pricing and specify ownership rules. Update product information and adjust pricing
    anytime.
  </p>
  {#if !items.length}
    <div class="text-center py-8">
      <p class="text-gray-500">No files found</p>
    </div>
  {:else}
    <div class="overflow-x-auto">
      <table class="table border rounded-t-md border-[#e2e9f0]">
        <thead class="bg-[#f9fafa] text-[#282828]">
          <tr>
            <th><span class="block py-px border-r border-[#e2e9f0]">Name</span></th>
            <th><span class="block py-px border-r border-[#e2e9f0]">Description</span></th>
            <th><span class="block py-px border-r border-[#e2e9f0]">ID</span></th>
            <th><span class="block py-px border-r border-[#e2e9f0]">Type</span></th>
            <th><span class="block py-px border-r border-[#e2e9f0]">Pricing</span></th>
            <th><span class="block py-px border-r border-[#e2e9f0]">Created on</span></th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {#each items as item, i (item.id)}
            <tr
              class="text-[13px] text-[#707070] cursor-pointer hover:bg-gray-100 transition-colors {i % 2 !== 0
                ? 'bg-[#f9fafa]'
                : ''}"
              role="button"
            >
              {#await fetchContentTokenMeta(data.contentContract!, item.tokenId)}
                <td>Loading title...</td>
                <td>Loading description...</td>
              {:then meta}
                <td>{meta.title || 'N/A'}</td>
                <td>{meta.description || 'N/A'}</td>
              {/await}
              <td class="flex items-center gap-2">
                <span>{item.id}</span>
                <button
                  onclick={(e) => {
                    e.stopPropagation()
                    copyToClipboard(item.id, 'ID copied to clipboard')
                  }}
                  class="w-10 h-10 cursor-pointer hover:opacity-70 border-0 bg-transparent p-0"
                  title="Copy ID"
                >
                  <CopyIcon />
                </button>
              </td>
              <td>.{item.key.split('/').pop()?.split('.')?.pop() || 'N/A'}</td>
              {#await getFilePricing(data.contentContract!, item.tokenId)}
                <td>Loading pricing...</td>
              {:then { fulltimeLicensePrice, onetimeLicensePrice }}
                <td>${fulltimeLicensePrice}/${onetimeLicensePrice}</td>
              {/await}
              <td>{formatDate(item.createdAt)}</td>
              <td>
                <button
                  onclick={(e) => {
                    e.stopPropagation()
                    openFile(item.id)
                  }}
                  class="w-10 h-10 cursor-pointer hover:opacity-70 border-0 bg-transparent p-0 text-[#acb3ba]"
                  title="Open file"
                >
                  <DetailsIcon />
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>
