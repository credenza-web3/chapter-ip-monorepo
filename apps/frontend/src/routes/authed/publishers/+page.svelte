<script lang="ts">
  let { data } = $props()
</script>

<div class="mx-auto w-full max-w-360 px-6">
  <section
    class="rounded-2xl border border-[#ebe6df] bg-[#f8f5f1] px-4 py-8 sm:px-6 lg:px-13 lg:py-12"
    aria-labelledby="publishers-heading"
  >
    <h2 id="publishers-heading" class="text-lg font-semibold text-dark">Publishers</h2>

    <div class="my-6 border-t border-[#e5e0d9]"></div>

    {#if data.publishers.length > 0}
      <ol class="space-y-4">
        {#each data.publishers as item, i (item.id)}
          <li>
            <a href={`/authed/publishers/${item.id}`} class="flex items-end gap-3 transition-colors hover:opacity-80">
              <span class="text-sm font-medium text-[#747474] w-5 text-right">{i + 1}.</span>
              {#if item.avatarUrl}
                <img src={item.avatarUrl} alt={item.title} class="size-7 rounded-full object-cover" />
              {:else}
                <div
                  class="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-white text-sm font-semibold"
                >
                  {item.title?.slice(0, 1)?.toUpperCase()}
                </div>
              {/if}
              <span class="truncate text-base font-semibold text-dark">{item.title}</span>
              <span class="truncate text-[12px]">ID - {item.id}</span>
            </a>
          </li>
        {/each}
      </ol>
    {:else}
      <div class="py-16 text-center">
        <p class="text-[#747474]">No publishers available.</p>
      </div>
    {/if}
  </section>
</div>
