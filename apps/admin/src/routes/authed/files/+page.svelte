<script lang="ts">
  import { formatKM } from '$lib/services/formatDate.js'
  import { fetchContentTokenMeta } from '@repo/fe-services'
  import PublisherCreated from './PublisherCreated.svelte'
  import { formatDate, getFilePricing } from './helper'
  import Arrow from '$lib/assets/arrow-narrow-up.svg'
  import Code from '$lib/assets/code.svg'
  import RowActionMenu from '$lib/components/RowActionMenu.svelte'
  import Edit from '$lib/assets/edit.svg'
  import { menuItems } from './constants'

  let { data } = $props()
  let { items } = data.paginatedResponse

  let activeFilter = $state('All')
  let activeMenuRow = $state<string | null>(null)
</script>

{#if !items.length}
  <PublisherCreated />
{:else}
  <div class="min-h-screen border border-[#1a1a2e0d] rounded-3xl bg-[#f8f5f1] p-8 md:p-12.5">
    <div class="mb-8">
      <h1 class="text-lg font-semibold mb-1.5">Getting started with ChapterIP</h1>
      <p class="text-sm font-medium text-[#767682]">What do you want to license today?</p>
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
  </div>
{/if}
