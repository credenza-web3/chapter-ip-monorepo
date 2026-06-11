<script lang="ts">
  import type { LikenessPurchase } from './types'

  type Image = LikenessPurchase['images'][number]

  let {
    purchase,
    onSelectImage,
  }: {
    purchase: LikenessPurchase
    onSelectImage: (image: Image) => void
  } = $props()
</script>

<div class="min-w-0">
  <section aria-label="Likeness gallery">
    <button
      type="button"
      class="block aspect-square w-full overflow-hidden bg-[#202225]"
      aria-label={`Enlarge ${purchase.images[0].alt}`}
      onclick={() => onSelectImage(purchase.images[0])}
    >
      <img src={purchase.images[0].src} alt={purchase.images[0].alt} class="size-full object-cover" />
    </button>

    {#if purchase.images.length > 1}
      <div class="mt-2.5 grid grid-cols-4 gap-1.75">
        {#each purchase.images.slice(1, 5) as image (image.alt)}
          <button
            type="button"
            class="aspect-square overflow-hidden bg-[#202225] transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-primary"
            aria-label={`Enlarge ${image.alt}`}
            onclick={() => onSelectImage(image)}
          >
            <img src={image.src} alt={image.alt} class="size-full object-cover" />
          </button>
        {/each}
      </div>
    {/if}
  </section>

  {#if purchase.attributes.length > 0}
    <section aria-labelledby="attributes-heading" class="mt-6.25">
      <h2 id="attributes-heading" class="font-sans text-base leading-5.25 font-semibold text-[#202225]">
        Physical attributes
      </h2>
      <dl class="mt-2 grid grid-cols-[91px_minmax(0,1fr)] gap-x-4 gap-y-2.5 text-sm leading-4.5 text-[#72717b]">
        {#each purchase.attributes as attribute (attribute.label)}
          <dt class="font-semibold">{attribute.label}:</dt>
          <dd class="break-words">{attribute.value}</dd>
        {/each}
      </dl>
    </section>
  {/if}

  {#if purchase.affiliations.length > 0}
    <section aria-labelledby="affiliations-heading" class="mt-8.75">
      <h2 id="affiliations-heading" class="font-sans text-base leading-5.25 font-semibold text-[#202225]">
        Union affiliations
      </h2>
      <dl class="mt-2 grid grid-cols-[91px_minmax(0,1fr)] gap-x-4 gap-y-2.5 text-sm leading-4.5 text-[#72717b]">
        {#each purchase.affiliations as affiliation (`${affiliation.union}-${affiliation.memberId}`)}
          <dt class="font-semibold">{affiliation.union || 'Member'}:</dt>
          <dd class="break-words">{affiliation.memberId || 'N/A'}</dd>
        {/each}
      </dl>
    </section>
  {/if}
</div>
