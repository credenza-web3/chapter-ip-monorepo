<script lang="ts">
  import { goto } from '$app/navigation'
  import { formatDate, formatKM } from '$lib/services/formatDate.js'
  import { fetchContentTokenMeta } from '@repo/fe-services'
  import RecentFiles from './RecentFiles.svelte'
  import { getFilePricing } from './helper'
  import { useClipboard } from '$lib/hooks/useClipboard.svelte'
  import CopyIcon from '$lib/components/icons/CopyIcon.svelte'
  import DetailsIcon from '$lib/components/icons/DetailsIcon.svelte'
  import CheckImg from '$lib/assets/check-circle.svg'

  let { data } = $props()
  let { items } = data.paginatedResponse

  const openFile = (id: string) => {
    goto(`/authed/files/${id}`)
  }

  const { copyToClipboard } = useClipboard()
</script>

<RecentFiles />

<div class="min-h-xl p-8 border border-[#eef2f6] rounded-3xl bg-white">
  <h2 class=" mb-2.5 font-semibold text-2xl leading-7.25 text-[#202025]">Creator Dashboard</h2>
  <p class=" mb-4 font-normal text-sm leading-6 text-[#747474]">
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
            <th><span class="block py-px border-r border-[#e2e9f0] text-center">Type</span></th>
            <th><span class="block py-px border-r border-[#e2e9f0] text-center">One-time license</span></th>
            <th><span class="block py-px border-r border-[#e2e9f0] text-center">Lifetime license</span></th>
            <th><span class="block py-pxtext-center">Created on</span></th>
            <th class="border-l border-[#e2e9f0]"></th>
          </tr>
        </thead>

        <tbody>
          {#each items as item, i (item.id)}
            {#await Promise.all( [fetchContentTokenMeta(data.contentContract!, item.tokenId), getFilePricing(data.contentContract!, item.tokenId)], )}
              <tr>
                <td colspan="8" class="text-center text-gray-400">Loading...</td>
              </tr>
            {:then [meta, { onetimeLicensePrice, fulltimeLicensePrice }]}
              <tr
                class="text-[13px] text-[#707070] cursor-pointer hover:bg-gray-100 transition-colors {i % 2 !== 0
                  ? 'bg-[#f9fafa]'
                  : ''}"
                role="button"
              >
                <td class="font-semibold text-[#202025]">{meta.title || 'N/A'}</td>
                <td>{meta.description || 'N/A'}</td>
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
                <td class="text-center">.{item.key.split('/').pop()?.split('.')?.pop() || 'N/A'}</td>
                <td>
                  <div class="flex items-center gap-2.5 justify-center">
                    <img src={CheckImg} alt="CheckImg" class="size-5 object-contain" />
                    <span>${formatKM(onetimeLicensePrice)}</span>
                  </div>
                </td>
                <td>
                  <div class="flex items-center gap-2.5 justify-center">
                    <img src={CheckImg} alt="CheckImg" class="size-5 object-contain" />
                    <span>${formatKM(fulltimeLicensePrice)}</span>
                  </div>
                </td>
                <td class="text-center">{formatDate(item.createdAt)}</td>
                <td class="border-l border-[#e2e9f0]">
                  <button
                    onclick={(e) => {
                      e.stopPropagation()
                      openFile(item.id)
                    }}
                    class="w-10 h-10 cursor-pointer hover:opacity-70 border-0 bg-transparent p-0 text-[#acb3ba] flex justify-center items-center"
                    title="Open file"
                  >
                    <DetailsIcon />
                  </button>
                </td>
              </tr>
            {/await}
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>
