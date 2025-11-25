<script lang="ts">
  let { data } = $props()
</script>

<div class="container mx-auto px-4 py-8">
  <h1 class="text-4xl font-bold mb-8">Publishers</h1>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {#each data.publishers as publisher}
      <a href="/authed/publishers/{publisher.id}" class="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
        <div class="card-body">
          <h2 class="card-title">{publisher.name}</h2>
          <p class="text-base-content/70">{publisher.description}</p>
          <div class="card-actions justify-end">
            <div class="badge badge-primary">{publisher.productCount} products</div>
          </div>
        </div>
      </a>
    {/each}
  </div>
</div>
