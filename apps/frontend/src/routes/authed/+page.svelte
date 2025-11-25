<script lang="ts">
  let { data } = $props()
</script>

<div class="container mx-auto px-4 py-8">
  <h1 class="text-4xl font-bold mb-8">My Purchases</h1>

  {#if data.purchases.length === 0}
    <div class="alert">
      <span>You haven't made any purchases yet.</span>
      <a href="/authed/publishers" class="btn btn-sm btn-primary">Browse Publishers</a>
    </div>
  {:else}
    <div class="grid grid-cols-1 gap-4">
      {#each data.purchases as purchase}
        <div class="card bg-base-100 shadow-lg">
          <div class="card-body">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div class="flex-1">
                <h3 class="card-title">{purchase.title}</h3>
              </div>
              <div class="flex flex-col sm:flex-row gap-2">
                <a href="/authed/{purchase.id}" class="btn btn-sm btn-primary"> View Details </a>
                <button class="btn btn-sm btn-outline"> Download </button>
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>

    <div class="stats shadow mt-8 w-full">
      <div class="stat">
        <div class="stat-title">Total Purchases</div>
        <div class="stat-value">{data.purchases.length}</div>
      </div>
      <div class="stat">
        <div class="stat-title">Total Spent</div>
        <div class="stat-value text-primary">
          ${data.purchases.reduce((sum: number, purchase: { price: number }) => sum + purchase.price, 0).toFixed(2)}
        </div>
      </div>
    </div>
  {/if}
</div>
