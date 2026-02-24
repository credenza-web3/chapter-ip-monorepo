<script lang="ts">
  import AvatarDefault from '$lib/assets/user-placeholder.svg'
  import AddFundsButton from './AddFundsButton.svelte'

  let { data } = $props()
  let searchQuery = $state('')

  const filteredPublishers = $derived(() =>
    data.publishers.filter(publisher =>
      publisher.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  )
</script>

<div class="container mx-auto px-4 py-8">
  <div class="flex justify-between items-center mb-8">
    <h1 class="text-4xl font-bold">Publishers</h1>
    <AddFundsButton />
  </div>

  <div class="mb-6">
    <input
      type="text"
      placeholder="Search publishers by name..."
      bind:value={searchQuery}
      class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
  
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {#each filteredPublishers() as publisher}
      <a
        href="/authed/publishers/{publisher.id}"
        class="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow border border-gray-200 p-4"
      >
        <div class="flex items-center gap-4">
          <div class="h-14 w-auto overflow-hidden">
            <img src={publisher.avatarUrl || AvatarDefault} alt="Publisher avatar" class="w-full h-full object-cover" />
          </div>
          <h2 class="card-title">{publisher.title}</h2>
        </div>
      </a>
    {:else}
      {#if searchQuery}
        <div class="col-span-full text-center py-8">
          <p class="text-gray-500">No publishers found matching "{searchQuery}"</p>
        </div>
      {:else}
        <div class="col-span-full text-center py-8">
          <p class="text-gray-500">No publishers available</p>
        </div>
      {/if}
    {/each}
  </div>
</div>
