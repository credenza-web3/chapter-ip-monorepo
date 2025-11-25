<script lang="ts">
  let { data } = $props()
</script>

<div class="container mx-auto px-4 py-8">
  <div class="breadcrumbs text-sm mb-6">
    <ul>
      <li><a href="/authed/publishers">Publishers</a></li>
      <li><a href="/authed/publishers/{data.publisherId}">{data.product.publisher.name}</a></li>
      <li>{data.product.title}</li>
    </ul>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <div class="lg:col-span-1">
      <div class="card bg-base-200 shadow-xl sticky top-4">
        <div class="card-body">
          <div class="text-center mb-4">
            <div class="text-4xl font-bold text-primary">${data.product.price}</div>
          </div>

          <button class="btn btn-primary btn-lg w-full mb-2"> Purchase Now </button>

          <div class="divider"></div>

          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <span class="text-2xl">📥</span>
              <span class="text-sm">Instant download</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-2xl">🔒</span>
              <span class="text-sm">Secure payment</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-2xl">♾️</span>
              <span class="text-sm">Lifetime access</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
