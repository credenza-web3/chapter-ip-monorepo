<script lang="ts">
  import { goto } from '$app/navigation'
  import { formatDate } from '$lib/services/formatDate.js'
  import SortIcon from '$lib/assets/descending_regular_icon.png'
  import Feather from '$lib/assets/feather_icon.png'
  import { getTokenPrice } from './getTokenPrice.js'

  let { data } = $props()

  let sortAsc = true

  const openFile = (id: string) => {
    goto(`/authed/files/${id}`)
  }
  const sortByName = () => {
    // data.paginatedResponse.items.sort((a, b) => {
    //   const nameA = a.name.toLowerCase()
    //   const nameB = b.name.toLowerCase()
    //   if (nameA < nameB) return sortAsc ? -1 : 1
    //   if (nameA > nameB) return sortAsc ? 1 : -1
    //   return 0
    // })
    sortAsc = !sortAsc
  }
</script>

<div class="min-h-xl p-4">
  <h1 class="text-2xl font-bold text-gray-900 mb-12">Dashboard</h1>
  <div class="flex w-full justify-end mb-2">
    <button
      class="flex items-center gap-2 text-xs text-[#6B7280] hover:text-[#A323EB] font-medium cursor-pointer"
      onclick={() => console.log('Add file')}
    >
      Add File
      <div class="w-7 h-7 bg-[#A323EB] text-white rounded-full relative">
        <span class="leading-[25px] flex items-center justify-center text-xl"> + </span>
      </div>
    </button>
  </div>
  <div class="overflow-x-auto">
    <table class="table bg-white border border-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th>
            <button class="flex items-center gap-1" onclick={sortByName}>
              <span>Name</span>
              <span class="border-l border-gray-600 h-4 mx-2"></span>
              <img src={SortIcon} alt="Sort" class="w-5 h-5 object-contain cursor-pointer" />
            </button>
          </th>

          <th>ID</th>
          <th>Pricing [Life/One-time]</th>
          <th>Created on</th>
          <th></th>
        </tr>
      </thead>

      <tbody>
        {#each data.paginatedResponse.items as item (item.id)}
          {#await getTokenPrice(item.tokenId) then price}
            <tr>
              <td></td>
              <td>{item.id}</td>
              <td>$ {price.fulltime}/{price.onetime}</td>
              <td>{formatDate(item.createdAt)}</td>
              <td
                ><button
                  type="button"
                  class="size-7 object-contain cursor-pointer bg-none border-none p-0"
                  onclick={() => openFile(item.id)}
                >
                  <img src={Feather} alt="Open file" class="size-7 object-contain" />
                </button></td
              >
            </tr>
          {/await}
        {/each}
      </tbody>
    </table>
  </div>
</div>
