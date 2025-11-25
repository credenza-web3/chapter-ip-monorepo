<script lang="ts">
  let { data } = $props()
</script>

<div class="container mx-auto px-4 py-8">
  <div class="breadcrumbs text-sm mb-6">
    <ul>
      <li><a href="/authed/publishers">Publishers</a></li>
      <li>{data.publisher.name}</li>
    </ul>
  </div>

  <div class="mb-8">
    <h1 class="text-4xl font-bold mb-2">{data.publisher.name}</h1>
    <p class="text-lg text-base-content/70">{data.publisher.description}</p>
  </div>

  <h2 class="text-2xl font-semibold mb-4">Products</h2>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {#each data.products as product}
      <a
        href="/authed/publishers/{data.publisher.id}/{product.id}"
        class="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow"
      >
        <figure class="px-10 pt-10">
          <div class="avatar placeholder">
            <div class="bg-neutral text-neutral-content rounded-xl w-24">
              <span class="text-3xl">📄</span>
            </div>
          </div>
        </figure>
        <div class="card-body">
          <h3 class="card-title">{product.title}</h3>
          <p class="text-sm text-base-content/70">{product.description}</p>
          <div class="card-actions justify-between items-center mt-4">
            <span class="text-2xl font-bold text-primary">${product.price}</span>
            <button class="btn btn-primary btn-sm">View Details</button>
          </div>
        </div>
      </a>
    {/each}
  </div>
</div>
