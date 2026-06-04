<script lang="ts">
  import type { TMetadata } from './types.ts'
  import NewUploads from './NewUploads.svelte'
  import { formatKM } from '$lib/services/formatDate.js'
  import { formatDate } from './helper'
  import Code from '$lib/assets/code.svg'
  import RowActionMenu from '$lib/components/RowActionMenu.svelte'
  import Edit from '$lib/assets/edit.svg'
  import { menuItems } from './constants'

  let { data } = $props()
  let activeFilter = $state('All')
  let activeMenuRow = $state<string | null>(null)
  let currentPage = $state(1)

  const pageSize = 50
  const filters = ['All', 'Written works', 'Locations', 'Likeness'] as const

  const typeOrder = {
    'Written works': 0,
    Locations: 1,
    Likeness: 2,
  }

  const normalizeFileType = (type?: string) => {
    const t = String(type ?? '')
      .trim()
      .toLowerCase()

    if (t.includes('likeness')) return 'Likeness'
    if (t.includes('location')) return 'Locations'
    if (t.includes('written')) return 'Written works'

    return 'Written works'
  }

  const rows = $derived(
    data.items
      .map((item) => {
        const licensing = item.metadata?.licensing ?? {}
        const licenseTypes = licensing.licenseTypes ?? {}
        const getLicenseTypes = (metadata: TMetadata): string[] =>
          Object.entries(metadata?.licensing?.licenseTypes ?? {})
            .filter(([, value]) => value)
            .map(([key]) => key)

        return {
          id: item.id,
          item,
          listingName: item?.metadata?.profile.fullLegalName || item?.metadata?.profile.stageName || 'Untitled',
          fileType: normalizeFileType(item?.metadata?.type),
          licenseType: getLicenseTypes(item.metadata as TMetadata),
          status: 'Active',
          sales: item.statistic?.boughtLicensesAmount ?? 0,
          revenue: item.statistic?.revenue ?? { fiat: '0', token: '0', eth: '0' },
        }
      })
      .sort(
        (a, b) =>
          (typeOrder[a.fileType as keyof typeof typeOrder] ?? 0) -
          (typeOrder[b.fileType as keyof typeof typeOrder] ?? 0),
      ),
  )

  const filteredRows = $derived(activeFilter === 'All' ? rows : rows.filter((row) => row.fileType === activeFilter))
  const totalPages = $derived(Math.max(1, Math.ceil(filteredRows.length / pageSize)))
  const safeCurrentPage = $derived(Math.min(currentPage, totalPages))
  const paginatedRows = $derived(filteredRows.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize))
  const writtenWorksCount = $derived(rows.filter((row) => row.fileType === 'Written works').length)
  const locationsCount = $derived(rows.filter((row) => row.fileType === 'Locations').length)
  const likenessCount = $derived(rows.filter((row) => row.fileType === 'Likeness').length)
</script>

<div class="min-h-xl md:p-8 p-y-6 border border-[#eef2f6] rounded-3xl bg-[#f8f5f1]">
  <h2 class="md:mb-2.5 font-semibold md:text-2xl text-xl leading-7.25 text-[#202025]">
    Getting started with ChapterIP
  </h2>
  <p class="mb-4 font-normal text-sm leading-6 text-[#747474]">What do you want to license today?</p>
  {#if !rows.length}
    <NewUploads />
  {:else}
    <div class="md:mt-9.75">
      <div
        class="flex flex-col md:flex-row md:items-center justify-between py-4 border-b border-[#f0ede6] gap-4 md:gap-0"
      >
        <div class="flex flex-col md:flex-row md:items-center md:gap-2.5">
          <h2 class="md:text-base text-sm font-semibold">My Listings</h2>
          <span class="text-[13px] font-medium text-[#1A1A2E]/60">
            Written works: {writtenWorksCount} | Locations: {locationsCount} | Likeness: {likenessCount}
          </span>
        </div>
        <div class="flex md:gap-1">
          {#each filters as f (f)}
            {@const isDisabled = f === 'Written works' || f === 'Locations'}
            <button
              onclick={() => {
                if (isDisabled) return
                activeFilter = f
                currentPage = 1
              }}
              disabled={isDisabled}
              class="md:px-5.25 px-3 py-1 rounded-full md:text-[13px] text-[11px] font-medium {activeFilter === f
                ? 'bg-[#6d6b76] text-[#f8f5f1]'
                : 'text-dark rounded-full'} {isDisabled ? 'opacity-30 cursor-not-allowed' : ''}"
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
                <th class="px-4 py-3.5">Sales</th>
                <th class="px-4 py-3.5">Status</th>
                <th class="px-4 py-3.5">Revenue</th>
                <!-- <th class="px-4 py-3.5"></th> -->
              </tr>
            </thead>
            <tbody>
              {#if paginatedRows.length}
                {#each paginatedRows as row, i (row.id)}
                  <tr
                    class="border-b border-[#ddd] last:border-0 {activeMenuRow === row.id
                      ? 'bg-[#ece7df]'
                      : i % 2 === 0
                        ? 'bg-[#f8f5f1]'
                        : 'bg-cream'}"
                  >
                    <td class="px-4 py-1.5">{formatDate(row.item.createdAt)}</td>
                    <td class="px-4 py-1.5">{row.listingName}</td>
                    <td class="px-4 py-1.5">{row.fileType}</td>
                    <td class="px-4 py-1.5">
                      {#if row.licenseType.length}
                        {#each row.licenseType as type, i (`${row.id}-lt-${i}`)}
                          <div>{type}</div>
                        {/each}
                      {:else}
                        N/A
                      {/if}
                    </td>
                    <td class="px-4 py-1.5">
                      {row.sales}
                    </td>
                    <td class="px-4 py-1.5">
                      {#if row.status === 'Active'}
                        <span
                          class="inline-flex items-center gap-1 px-2.5 py-1.25
                          rounded-sm border border-[#93C4A1]/25 bg-[#f1fbf5] text-[#499b60] text-sm"
                        >
                          ✓ Active
                        </span>
                      {:else if row.status === 'Disabled'}
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

                    <td class="px-4 py-1.5">
                      ${formatKM(Number(row.revenue.token) / 1e6)}
                    </td>
                    <!-- <td class="px-4 py-1.5 text-right">
                      <RowActionMenu
                        items={menuItems}
                        buttonLabel={`Open actions for ${row.listingName || 'listing'}`}
                        onOpenChange={(open) => (activeMenuRow = open ? row.id : null)}
                      />
                    </td> -->
                  </tr>
                {/each}
              {:else}
                <tr class="border-b border-[#ddd] last:border-0 bg-[#f8f5f1]">
                  <td colspan="8" class="px-4 py-4 text-center">No listings for this file type</td>
                </tr>
              {/if}
            </tbody>
          </table>
        </div>
      </div>

      <div class="pt-2.75 text-[13px] font-medium text-[#b6b4b7] flex justify-between">
        <span class="text-[#1A1A2E]/60">
          Showing {paginatedRows.length ? (safeCurrentPage - 1) * pageSize + 1 : 0}-
          {Math.min(safeCurrentPage * pageSize, filteredRows.length)} of {filteredRows.length} listings
        </span>
        <div class="flex items-center gap-1.5">
          <button
            type="button"
            class="inline-flex items-center mr-4.75 disabled:opacity-40 disabled:cursor-not-allowed"
            onclick={() => (currentPage = Math.max(1, safeCurrentPage - 1))}
            disabled={safeCurrentPage === 1}
          >
            <img src={Code} alt="Previous" class="h-3 rotate-180 inline-block mr-1" />
            <span class="cursor-pointer hover:text-[#555]">Previous</span>
          </button>
          <button
            type="button"
            class="inline-flex items-center disabled:opacity-40 disabled:cursor-not-allowed"
            onclick={() => (currentPage = Math.min(totalPages, safeCurrentPage + 1))}
            disabled={safeCurrentPage === totalPages}
          >
            <span class="cursor-pointer hover:text-[#555]">Next</span>
            <img src={Code} alt="Next" class="size-3 inline-block ml-1" />
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>
