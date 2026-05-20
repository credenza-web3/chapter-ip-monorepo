<script lang="ts">
	import NewUploads from './NewUploads.svelte';
  import { formatKM } from '$lib/services/formatDate.js'
  import { fetchContentTokenMeta } from '@repo/fe-services'
  import { formatDate, getFilePricing } from './helper'
  import Arrow from '$lib/assets/arrow-narrow-up.svg'
  import Code from '$lib/assets/code.svg'
  import RowActionMenu from '$lib/components/RowActionMenu.svelte'
  import Edit from '$lib/assets/edit.svg'
  import { menuItems } from './constants'
  import RecentFiles from './RecentFiles.svelte'
  import CopyIcon from '$lib/components/icons/CopyIcon.svelte'
  import DetailsIcon from '$lib/components/icons/DetailsIcon.svelte'
  import CheckImg from '$lib/assets/check-circle.svg'

  let { data } = $props()
  let { items } = data.paginatedResponse

  let activeFilter = $state('All')
  let activeMenuRow = $state<string | null>(null)
</script>

<RecentFiles />

<div class="min-h-xl p-8 border border-[#eef2f6] rounded-3xl bg-[#f8f5f1]">
  <h2 class="mb-2.5 font-semibold text-2xl leading-7.25 text-[#202025]">Getting started with ChapterIP</h2>
  <p class="mb-4 font-normal text-sm leading-6 text-[#747474]">What do you want to license today?</p>
  {#if !items.length}
    <NewUploads />
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

    <div class="flex items-center justify-between mb-6">
      <div>
        <p class="text-base font-semibold">Total Revenue</p>
        <div class="flex items-center gap-3.75">
          <span class="text-4xl font-semibold">$29,400.00</span>
          <div
            class="flex items-center gap-1 px-3.75 py-1.5 rounded-full border border-[#93c4a1] bg-[#e6f5ea]
            text-[13px] font-semibold text-left text-[#499b60]"
          >
            <span>7.9%</span>
            <img src={Arrow} alt="Up" />
          </div>
        </div>
      </div>
    </div>

    <div class="mt-9.75">
      <div class="flex items-center justify-between py-4 border-b border-[#f0ede6]">
        <div class="flex items-center gap-2.5">
          <h2 class="text-base font-semibold">My Listings</h2>
          <span class="text-[13px] font-medium text-[#1A1A2E]/60">Written works: 1 | Locations: 1 | Likeness: 3</span>
        </div>
        <div class="flex gap-1">
          {#each ['All', 'Written works', 'Locations', 'Likeness'] as f (f)}
            <button
              onclick={() => (activeFilter = f)}
              class="px-5.25 py-1 rounded-full text-[13px] font-medium {activeFilter === f
                ? 'bg-[#6d6b76] text-[#f8f5f1]'
                : 'text-dark rounded-full'}"
            >
              {f}
            </button>
          {/each}
        </div>
      </div>

      <div class="border border-[#ddd] rounded-md overflow-visible">
        <div class="overflow-x-auto">
          <table class="w-full text-sm font-medium text-[#1A1A2E]/60">
            <thead>
              <tr class="text-left border-b border-[#ddd] bg-cream">
                <th class="px-4 py-3.5 align-middle">
                  <div class="flex items-center gap-2.5 cursor-pointer hover:text-[#555]">
                    Create on
                    <img src={Code} alt="Sort" class="size-2.5 rotate-90" />
                  </div>
                </th>
                <th class="px-4 py-3.5">File name</th>
                <th class="px-4 py-3.5">File type</th>
                <th class="px-4 py-3.5">License type</th>
                <th class="px-4 py-3.5">Status</th>
                <th class="px-4 py-3.5">Sales</th>
                <th class="px-4 py-3.5">Revenue</th>
                <th class="px-4 py-3.5"></th>
              </tr>
            </thead>
            <tbody>
              {#each items as item, i (item.id)}
                {#await Promise.all( [fetchContentTokenMeta(data.contentContract!, item.tokenId), getFilePricing(data.contentContract!, item.tokenId)], )}
                  <tr class="border-b border-[#ddd] last:border-0 bg-[#f8f5f1]">
                    <td colspan="8" class="px-4 py-0.75 text-center">Loading...</td>
                  </tr>
                {:then [meta, { onetimeLicensePrice, fulltimeLicensePrice }]}
                  {@const mockStatus = (['Active', 'Disabled', 'Active', 'Active', 'Draft'] as const)[i] ?? 'Active'}
                  {@const mockSales = [3, 0, 12, 0, null][i] ?? null}
                  {@const mockRev = [15000, 0, 14400, 0, null][i] ?? null}

                  <tr
                    class="border-b border-[#ddd] last:border-0 {activeMenuRow === item.id
                      ? 'bg-[#ece7df]'
                      : i % 2 === 0
                        ? 'bg-[#f8f5f1]'
                        : 'bg-cream'}"
                  >
                    <td class="px-4 py-1.5">{formatDate(item.createdAt)}</td>
                    <td class="px-4 py-1.5">{meta.title || 'N/A'}</td>
                    <td class="px-4 py-1.5">{meta.type || 'Likeness'}</td>
                    <td class="px-4 py-1.5">
                      {onetimeLicensePrice && fulltimeLicensePrice ? 'Time-limited' : 'Single use'}
                    </td>
                    <td class="px-4 py-1.5">
                      {#if mockStatus === 'Active'}
                        <span
                          class="inline-flex items-center gap-1 px-2.5 py-1.25
                        rounded-sm border border-[#93C4A1]/25 bg-[#f1fbf5] text-[#499b60] text-sm"
                        >
                          ✓ Active
                        </span>
                      {:else if mockStatus === 'Disabled'}
                        <span
                          class="inline-flex items-center gap-1 px-2.5 py-1.25
                        rounded-sm border border-[#DE8C8C]/25 bg-[#fccaca] text-[#d14e4e] text-sm"
                        >
                          ✗ Disabled
                        </span>
                      {:else}
                        <span
                          class="inline-flex items-center gap-1 px-2.5 py-1.25
                        rounded-sm border border-[#D58B00]/20 bg-[#f2e3c8] text-[#d58b00] text-sm"
                        >
                          <img src={Edit} alt="Edit" class="size-2.5" /> Draft
                        </span>
                      {/if}
                    </td>
                    <td class="px-4 py-1.5">{mockSales ?? '–'}</td>
                    <td class="px-4 py-1.5">
                      {mockRev != null ? `$${formatKM(mockRev)}` : '–'}
                    </td>
                    <td class="px-4 py-1.5 text-right">
                      <RowActionMenu
                        items={menuItems}
                        buttonLabel={`Open actions for ${meta.title || 'listing'}`}
                        onOpenChange={(open) => (activeMenuRow = open ? item.id : null)}
                      />
                    </td>
                  </tr>
                {/await}
              {/each}
            </tbody>
          </table>
        </div>
      </div>

      <div class="pt-2.75 text-[13px] font-medium text-[#b6b4b7] flex justify-between">
        <span class="text-[#1A1A2E]/60">Showing {items.length} of {items.length} listings</span>
        <div class="flex items-center gap-1.5">
          <img src={Code} alt="Previous" class="h-3 rotate-180 inline-block mr-1" />
          <span class="cursor-pointer hover:text-[#555] mr-4.75">Previous</span>
          <span class="cursor-pointer hover:text-[#555]">Next</span>
          <img src={Code} alt="Next" class="size-3 inline-block ml-1" />
        </div>
      </div>
    </div>
  {/if}
</div>
