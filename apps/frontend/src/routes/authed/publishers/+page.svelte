<script lang="ts">
  import AvatarDefault from '$lib/assets/user-placeholder.svg'

  let { data } = $props()

  const loadContentCount = async (id: string) => {
    const { items } = await data.trpcClient!.publishers.findPublishers.query({
      id,
    })
    const publisher = items[0]

    const { items: contentItems } = await data.trpcClient!.files.findContent.query({
      sub: publisher.sub,
    })
    return contentItems.length
  }
</script>

<div class="container mx-auto px-4 py-8">
  <h1 class="text-4xl font-bold mb-8">Publishers</h1>
  <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
    {#each data.publishers as publisher}
      <a href="/authed/publishers/{publisher.id}" class="flex gap-4 bg-white border border-gray-200 rounded-lg p-6">
        <img src={publisher.avatarUrl || AvatarDefault} alt="Publisher avatar" class="size-14 object-cover" />
        <div class="flex flex-col">
          <h2 class="break-all">{publisher.title}</h2>
          {#await loadContentCount(publisher.id) then count}
            <p class="text-sm text-gray-600">Products ({count})</p>
          {/await}
        </div>
      </a>
    {/each}
  </div>
</div>
