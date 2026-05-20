<script lang="ts">
  import { goto } from '$app/navigation'
  import { formatKM } from '$lib/services/formatDate.js'
  import { fetchContentTokenMeta } from '@repo/fe-services'
  import PublisherCreated from './PublisherCreated.svelte'
  import { formatDate, getFilePricing } from './helper'
  import Arrow from '$lib/assets/arrow-narrow-up.svg'
  import Code from '$lib/assets/code.svg'
  import Edit from '$lib/assets/edit.svg'

  let { data } = $props()
  let { items } = data.paginatedResponse

  const openFile = (id: string) => goto(`/authed/files/${id}`)

  const purchaseItems = [
    {
      text: 'Written Works',
      href: '/authed/upload',
    },
    {
      text: 'Location',
      href: '/authed/location',
    },
    {
      text: 'Likeness',
      href: '/authed/likeness',
    },
  ]

  const purchaseHistory = [
    {
      date: '2026-04-14T10:23:11.000Z',
      fileName: 'Chadwick Bowser',
      licenseType: 'Time-limited',
      org: 'Netflix',
      amount: 1200,
    },
    {
      date: '2026-04-14T14:05:47.000Z',
      fileName: 'Madison Square Gardens',
      licenseType: 'Time-limited',
      org: 'Hulu',
      amount: 1200,
    },
    {
      date: '2026-04-10T09:18:33.000Z',
      fileName: 'Madison Square Gardens',
      licenseType: 'Time-limited',
      org: 'Disney',
      amount: 1200,
    },
    {
      date: '2026-03-06T16:44:02.000Z',
      fileName: 'Chadwick Bowser',
      licenseType: 'Single use',
      org: 'Netflix',
      amount: 15000,
    },
    {
      date: '2026-01-03T08:30:59.000Z',
      fileName: 'Chadwick Bowser',
      licenseType: 'Time-limited',
      org: 'Paramount',
      amount: 1200,
    },
  ]

  type FilterKey = 'All' | 'Written works' | 'Locations' | 'Likeness'
  let activeFilter = $state<FilterKey>('All')
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

      <div class="flex items-center gap-3.75">
        <div class="flex items-center gap-3">
          <button class=" text-[#888] hover:bg-[#f5f4f1] transition-colors" title="List view">
            <svg width="24" height="24" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
              <line x1="3" y1="4" x2="13" y2="4" /><line x1="3" y1="8" x2="13" y2="8" /><line
                x1="3"
                y1="12"
                x2="13"
                y2="12"
              />
            </svg>
          </button>
          <button class=" text-[#888] hover:bg-[#f5f4f1] transition-colors" title="Grid view">
            <svg width="24" height="24" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="2" y="2" width="5" height="5" rx="1" /><rect x="9" y="2" width="5" height="5" rx="1" />
              <rect x="2" y="9" width="5" height="5" rx="1" /><rect x="9" y="9" width="5" height="5" rx="1" />
            </svg>
          </button>
        </div>

        <div class="dropdown bg-transparent">
          <div
            tabindex="0"
            role="button"
            class="btn bg-transparent border-0 shadow-none hover:bg-transparent active:bg-transparent flex items-center
             gap-2 text-[15px] font-medium text-[#767682] px-none"
          >
            <button
              onclick={() => goto('/authed/files/new')}
              class="flex items-center gap-1.5 pl-5.75 pr-4.25 h-8.25 rounded-sm bg-primary text-xs font-medium text-center text-cream"
            >
              <span class="text-2xl font-normal">+</span> Add listing
            </button>
          </div>

          <ul
            tabindex="-1"
            class="dropdown-content menu rounded-box z-1 md:w-52 w-35 p-2 rounded-md
            shadow-[3px_6px_8px_0_rgba(21,34,50,0.08)]
            border border-[#1A1A2E1A] top-12
            bg-cream text-sm font-medium text-left text-[#1A1A2E99]"
          >
            {#each purchaseItems as item (item)}
              <li><a href={item.href}>{item.text}</a></li>
            {/each}
          </ul>
        </div>
      </div>
    </div>

    <div class="mt-9.75">
      <div class="flex items-center justify-between py-4 border-b border-[#f0ede6]">
        <div class="flex items-center gap-2.5">
          <h2 class="text-base font-semibold">My Listings</h2>
          <span class="text-[13px] font-medium">Written works: 1 | Locations: 1 | Likeness: 3</span>
        </div>
        <div class="flex gap-1">
          {#each ['All', 'Written works', 'Locations', 'Likeness'] as FilterKey[] as f (f)}
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

      <div class="overflow-x-auto border border-[#ddd] rounded-md">
        <table class="w-full text-sm font-medium text-[#1A1A2E]/60">
          <thead>
            <tr class="text-left border-b border-[#ddd] bg-cream">
              <th class="px-4 py-2.75 align-middle">
                <div class="flex items-center gap-2.5 cursor-pointer hover:text-[#555]">
                  Create on
                  <img src={Code} alt="Sort" class="size-2.5 rotate-90" />
                </div>
              </th>
              <th class="px-4 py-2.75">File name</th>
              <th class="px-4 py-2.75">File type</th>
              <th class="px-4 py-2.75">License type</th>
              <th class="px-4 py-2.75">Status</th>
              <th class="px-4 py-2.75">Sales</th>
              <th class="px-4 py-2.75">Revenue</th>
              <th class="px-4 py-2.75"></th>
            </tr>
          </thead>
          <tbody>
            {#each items as item, i (item.id)}
              {#await Promise.all( [fetchContentTokenMeta(data.contentContract!, item.tokenId), getFilePricing(data.contentContract!, item.tokenId)], )}
                <tr class="border-b border-[#ddd] last:border-0 {i % 2 === 0 ? 'bg-[#f8f5f1]' : 'bg-cream'}">
                  <td colspan="8" class="px-4 py-0.75 text-center">Loading...</td>
                </tr>
              {:then [meta, { onetimeLicensePrice, fulltimeLicensePrice }]}
                {@const mockStatus = (['Active', 'Disabled', 'Active', 'Active', 'Draft'] as const)[i] ?? 'Active'}
                {@const mockSales = [3, 0, 12, 0, null][i] ?? null}
                {@const mockRev = [15000, 0, 14400, 0, null][i] ?? null}

                <tr class="border-b border-[#ddd] last:border-0 {i % 2 === 0 ? 'bg-[#f8f5f1]' : 'bg-cream'}">
                  <td class="px-4 py-0.75">{formatDate(item.createdAt)}</td>
                  <td class="px-4 py-0.75">{meta.title || 'N/A'}</td>
                  <td class="px-4 py-0.75">{meta.type || 'Likeness'}</td>
                  <td class="px-4 py-0.75">
                    {onetimeLicensePrice && fulltimeLicensePrice ? 'Time-limited' : 'Single use'}
                  </td>
                  <td class="px-4 py-0.75">
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
                  <td class="px-4 py-0.75">{mockSales ?? '–'}</td>
                  <td class="px-4 py-0.75">
                    {mockRev != null ? `$${formatKM(mockRev)}` : '–'}
                  </td>
                  <td class="px-4 py-0.75 text-right">
                    <button
                      class="p-2 text-[#73727c] hover:text-[#555] cursor-pointer"
                      title="Options"
                      onclick={() => openFile(item.id)}
                    >
                      <span class="text-lg leading-none tracking-widest">···</span>
                    </button>
                  </td>
                </tr>
              {/await}
            {/each}
          </tbody>
        </table>
      </div>
      <div class="pt-2.75 text-[13px] font-medium text-right text-[#1A1A2E]/60">
        Showing {items.length} of {items.length} listings
      </div>
    </div>

    <div class="mt-13">
      <div class="flex items-center justify-between pb-4.5 border-b border-[#f0ede6]">
        <h2 class="text-base font-semibold">Purchase History</h2>
      </div>

      <div class="overflow-x-auto border border-[#ddd] rounded-md">
        <table class="w-full text-sm font-medium text-[#1A1A2E]/60 table-fixed">
          <thead>
            <tr class="text-left border-b border-[#ddd] bg-cream">
              <th class="px-4 py-2.75 align-middle">
                <div class="flex items-center gap-2.5 cursor-pointer select-none hover:text-[#555]">
                  Purchased on
                  <img src={Code} alt="Sort" class="size-2.5 rotate-90" />
                </div>
              </th>
              <th class="px-4 py-2.75">File Name</th>
              <th class="px-4 py-2.75">License type</th>
              <th class="px-4 py-2.75">Organization</th>
              <th class="px-4 py-2.75">Amount</th>
              <th class="px-4 py-2.75"></th>
            </tr>
          </thead>
          <tbody>
            {#each purchaseHistory as tx, i (i)}
              <tr class="border-b border-[#ddd] last:border-0 {i % 2 === 0 ? 'bg-[#f8f5f1]' : 'bg-cream'}">
                <td class="px-6 py-1.5">{formatDate(tx.date)}</td>
                <td class="px-4 py-1.5">{tx.fileName}</td>
                <td class="px-4 py-1.5">{tx.licenseType}</td>
                <td class="px-4 py-1.5">{tx.org}</td>
                <td class="px-4 py-1.5">${tx.amount.toLocaleString()}</td>
                <td class="px-4 py-1.5 text-right">
                  <button
                    onclick={() => goto(`/authed/transactions/${i}`)}
                    class="inline-flex items-center gap-1.5 bg-[#f8f5f1]
                    border border-[#ddd] rounded-[3px] px-2.5 py-1 hover:bg-[#f5f4f1] transition-colors"
                  >
                    <img src={Code} alt="View" class="size-3.75" />
                    View Details
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <div class="pt-2.75 text-[13px] font-medium text-right text-[#1A1A2E]/60">
        Showing 5 of 6 transactions |
        <button onclick={() => goto('/authed/transactions')} class="text-primary hover:underline">
          View all transactions
        </button>
      </div>
    </div>
  </div>
{/if}
