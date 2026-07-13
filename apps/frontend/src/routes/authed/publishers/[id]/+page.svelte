<script lang="ts">
  import { useDefaultImage } from '$lib/content/image'

  let { data } = $props()
</script>

<div class="mx-auto w-full max-w-360 px-6">
  <section
    class="rounded-2xl border border-[#ebe6df] bg-[#f8f5f1] px-4 py-8 sm:px-6 lg:px-13 lg:py-12"
    aria-labelledby="publisher-heading"
  >
    <div class="flex items-start gap-5">
      {#if data.publisher.avatarUrl}
        <img
          src={data.publisher.avatarUrl}
          alt={data.publisher.title}
          class="size-18.75 shrink-0 rounded-full object-cover"
        />
      {:else}
        <div
          class="flex size-18.75 shrink-0 items-center justify-center rounded-full bg-primary text-white text-3xl font-semibold"
        >
          {data.publisher.title?.slice(0, 1)?.toUpperCase()}
        </div>
      {/if}

      <div class="min-w-0 flex-1">
        <h1 id="publisher-heading" class="text-2xl font-bold text-dark">{data.publisher.title}</h1>

        <div class="mt-3 flex items-center gap-4 text-sm font-medium text-[#747474]">
          <span>0 followers</span>
          <span>0 following</span>
          <span>0 likes</span>
        </div>
      </div>
    </div>

    <div class="my-6 border-t border-[#e5e0d9]"></div>

    {#if data.items.length > 0}
      <div class="grid grid-cols-1 gap-x-6 gap-y-12 min-[420px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
        {#each data.items as item (item.id)}
          <a href={`/authed/likeness/${item.id}`} class="group min-w-0">
            <div class="overflow-hidden rounded-lg bg-black">
              <img
                src={item.imageUrl}
                alt={item.name}
                class="aspect-square w-full object-cover transition-opacity group-hover:opacity-85"
                onerror={useDefaultImage}
              />
            </div>
            <h3 class="mt-3 truncate text-base font-semibold text-dark">{item.name}</h3>
            {#if item.bio}
              <p class="mt-1 line-clamp-2 text-sm font-medium leading-4.5 text-[#747474]">
                {item.bio}
              </p>
            {/if}
          </a>
        {/each}
      </div>
    {:else}
      <div class="py-16 text-center">
        <p class="text-[#747474]">No publications yet.</p>
      </div>
    {/if}
  </section>
</div>
