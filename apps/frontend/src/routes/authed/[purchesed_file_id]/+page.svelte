<script lang="ts">
  let { data } = $props()
</script>

<div class="container mx-auto px-4 py-8">
  <div class="breadcrumbs text-sm mb-6">
    <ul>
      <li><a href="/authed">My Purchases</a></li>
      <li>{data.purchase.title}</li>
    </ul>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <div class="lg:col-span-2">
      <div class="alert alert-success mb-6">
        <span>✓ You own this product</span>
      </div>

      <h1 class="text-4xl font-bold mb-4">{data.purchase.title}</h1>

      <div class="card bg-base-200 mb-6">
        <div class="card-body">
          <h3 class="card-title">Purchase Information</h3>
          <div class="overflow-x-auto">
            <table class="table">
              <tbody>
                <tr>
                  <td class="font-semibold">Price Paid</td>
                  <td class="text-primary font-bold">${data.purchase.price}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="prose max-w-none">
        <h2>About this product</h2>
        <p>{data.purchase.description}</p>
      </div>
    </div>
  </div>
</div>
