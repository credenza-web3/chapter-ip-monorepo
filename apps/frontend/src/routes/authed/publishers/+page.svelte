<script lang="ts">
  import AvatarDefault from '$lib/assets/user-placeholder.svg'

  let { data } = $props()
</script>

<div class="container mx-auto px-4 py-8">
  <h1 class="text-4xl font-bold mb-8">Publishers</h1>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {#each data.publishers as publisher}
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
    {/each}
  </div>
</div>
