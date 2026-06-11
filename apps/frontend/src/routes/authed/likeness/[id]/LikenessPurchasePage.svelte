<script lang="ts">
  import type { LikenessPurchase } from './purchase'

  let { purchase } = $props<{ purchase: LikenessPurchase }>()

  let selectedImage = $state<LikenessPurchase['images'][number] | null>(null)
  let selectedLicenseId = $state('')

  const selectedLicense = $derived(
    purchase.licenses.find((license: LikenessPurchase['licenses'][number]) => license.id === selectedLicenseId),
  )

  $effect(() => {
    if (!selectedLicenseId && purchase.licenses[0]) selectedLicenseId = purchase.licenses[0].id
  })

  function closeImage() {
    selectedImage = null
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') closeImage()
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<article class="mx-auto w-full max-w-[1175px] overflow-hidden rounded-3xl border border-[#1a1a2e0d] bg-[#f8f5f1]">
  <header class="px-5 pb-7 pt-9 text-center sm:px-10 sm:pt-12">
    <div class="mx-auto flex max-w-[450px] items-center gap-4">
      <span class="h-px flex-1 bg-[#c8c4bc]"></span>
      <button
        type="button"
        class="size-20 shrink-0 overflow-hidden rounded-full sm:size-24"
        aria-label={`Enlarge portrait of ${purchase.name}`}
        onclick={() => (selectedImage = purchase.images[0])}
      >
        <img src={purchase.images[0].src} alt="" class="size-full object-cover" />
      </button>
      <span class="h-px flex-1 bg-[#c8c4bc]"></span>
    </div>
    <h1 class="mt-4 text-2xl font-semibold tracking-tight text-dark sm:text-[28px]">{purchase.name}</h1>
    {#if purchase.stageName}
      <p class="mt-1 text-sm font-medium text-[#7c7c8a]">Stage name: {purchase.stageName}</p>
    {/if}
  </header>

  <div class="grid gap-10 px-5 pb-10 sm:px-10 lg:grid-cols-[minmax(0,400px)_1fr] lg:px-[100px]">
    <section aria-label="Likeness gallery">
      <button
        type="button"
        class="block aspect-[1.18] w-full overflow-hidden rounded-xl bg-[#202225]"
        aria-label={`Enlarge ${purchase.images[0].alt}`}
        onclick={() => (selectedImage = purchase.images[0])}
      >
        <img src={purchase.images[0].src} alt={purchase.images[0].alt} class="size-full object-cover" />
      </button>

      <div class="mt-2.5 grid grid-cols-5 gap-1.5">
        {#each purchase.images.slice(1) as image (image.alt)}
          <button
            type="button"
            class="aspect-square overflow-hidden rounded-lg bg-[#202225] transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-primary"
            aria-label={`Enlarge ${image.alt}`}
            onclick={() => (selectedImage = image)}
          >
            <img src={image.src} alt={image.alt} class="size-full object-cover" />
          </button>
        {/each}
      </div>
    </section>

    <div class="flex min-w-0 flex-col gap-7">
      <section aria-labelledby="bio-heading">
        <h2 id="bio-heading" class="text-base font-semibold text-[#202225]">Bio</h2>
        <p class="mt-1.5 whitespace-pre-line text-base leading-relaxed text-[#72717b]">
          {purchase.bio || 'No biography provided.'}
        </p>
      </section>

      {#if purchase.attributes.length > 0}
        <section aria-labelledby="attributes-heading">
          <h2 id="attributes-heading" class="text-base font-semibold text-[#202225]">Physical attributes</h2>
          <dl class="mt-2 grid grid-cols-[minmax(90px,auto)_1fr] gap-x-4 gap-y-2 text-base text-[#72717b]">
            {#each purchase.attributes as attribute (attribute.label)}
              <dt class="font-semibold">{attribute.label}:</dt>
              <dd>{attribute.value}</dd>
            {/each}
          </dl>
        </section>
      {/if}

      {#if purchase.affiliations.length > 0}
        <section aria-labelledby="affiliations-heading">
          <h2 id="affiliations-heading" class="text-base font-semibold text-[#202225]">Union affiliations</h2>
          <dl class="mt-2 grid grid-cols-[minmax(90px,auto)_1fr] gap-x-4 gap-y-2 text-base text-[#72717b]">
            {#each purchase.affiliations as affiliation (`${affiliation.union}-${affiliation.memberId}`)}
              <dt class="font-semibold">{affiliation.union || 'Member'}</dt>
              <dd>{affiliation.memberId || 'N/A'}</dd>
            {/each}
          </dl>
        </section>
      {/if}
    </div>
  </div>

  <div class="border-t border-[#e2ddd6] px-5 py-10 sm:px-10 lg:px-[100px] lg:py-12">
    <div class="grid gap-10 lg:grid-cols-[1fr_320px]">
      <div class="space-y-9">
        <section aria-labelledby="licensing-heading">
          <h2 id="licensing-heading" class="text-lg font-semibold text-dark">Licensing types</h2>
          {#if purchase.licenses.length > 0}
            <div class="mt-4 space-y-3">
              {#each purchase.licenses as license (license.id)}
                <label
                  class={`flex cursor-pointer gap-3 rounded-xl border bg-white p-4 transition-colors ${
                    selectedLicenseId === license.id ? 'border-primary' : 'border-[#ded9d2]'
                  }`}
                >
                  <input
                    type="radio"
                    name="license"
                    value={license.id}
                    bind:group={selectedLicenseId}
                    class="radio radio-primary radio-sm mt-0.5"
                  />
                  <span class="min-w-0 flex-1">
                    <span class="flex flex-wrap items-baseline justify-between gap-2">
                      <span class="font-semibold text-dark">{license.name}</span>
                      <span class="font-semibold text-dark"
                        >${license.price} <small class="text-[#7a7a8a]">USD</small></span
                      >
                    </span>
                    {#if license.detail}
                      <span class="mt-1 block text-sm text-[#747474]">{license.detail}</span>
                    {/if}
                  </span>
                </label>
              {/each}
            </div>
          {:else}
            <p class="mt-2 text-[#747474]">No licensing options are currently available.</p>
          {/if}
        </section>

        {#if purchase.permittedUses.length > 0}
          <section aria-labelledby="uses-heading">
            <h2 id="uses-heading" class="text-lg font-semibold text-dark">Permitted uses</h2>
            <ul class="mt-3 flex flex-wrap gap-2">
              {#each purchase.permittedUses as use (use)}
                <li class="rounded-full bg-[#ebe5ff] px-3 py-1.5 text-sm font-semibold text-primary">✓ {use}</li>
              {/each}
            </ul>
          </section>
        {/if}

        <section aria-labelledby="terms-heading">
          <h2 id="terms-heading" class="text-lg font-semibold text-dark">Usage terms</h2>
          <dl class="mt-3 space-y-2 text-base text-[#747474]">
            {#if purchase.territories.length > 0}
              <div class="flex flex-wrap justify-between gap-2 border-b border-[#e2ddd6] pb-2">
                <dt class="font-semibold text-dark">Territory</dt>
                <dd>{purchase.territories.join(', ')}</dd>
              </div>
            {/if}
            <div class="flex justify-between gap-2 border-b border-[#e2ddd6] pb-2">
              <dt class="font-semibold text-dark">Minor retouching</dt>
              <dd>{purchase.allowRetouching ? 'Allowed' : 'Not allowed'}</dd>
            </div>
            <div class="flex justify-between gap-2">
              <dt class="font-semibold text-dark">Final-use approval</dt>
              <dd>{purchase.approveFinalUse ? 'Required' : 'Not required'}</dd>
            </div>
          </dl>
        </section>
      </div>

      <aside class="h-fit rounded-xl border border-[#ded9d2] bg-white p-5 lg:sticky lg:top-6">
        <p class="text-sm font-medium text-[#77757d]">Selected license</p>
        <p class="mt-1 font-semibold text-dark">{selectedLicense?.name ?? 'Choose a license'}</p>
        <div class="my-5 border-t border-[#e5e0d9]"></div>
        <div class="flex items-baseline justify-between gap-3">
          <span class="font-semibold text-dark">Total</span>
          <span class="text-xl font-semibold text-dark">
            {#if selectedLicense}${selectedLicense.price} <small class="text-xs text-[#7a7a8a]">USD</small>{:else}—{/if}
          </span>
        </div>
        <button
          type="button"
          disabled={!selectedLicense}
          class="mt-5 h-11 w-full rounded-sm bg-primary px-5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:bg-[#d8d3cf]"
        >
          Add to cart
        </button>
        <p class="mt-3 text-center text-xs text-[#8b8790]">Checkout will be available soon.</p>
      </aside>
    </div>
  </div>
</article>

{#if selectedImage}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 sm:p-8"
    role="presentation"
    onclick={(event) => {
      if (event.target === event.currentTarget) closeImage()
    }}
  >
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Enlarged likeness image"
      tabindex="-1"
      class="relative flex max-h-full max-w-5xl items-center justify-center"
    >
      <img
        src={selectedImage.src}
        alt={selectedImage.alt}
        class="max-h-[88vh] max-w-full rounded-xl object-contain shadow-2xl"
      />
      <button
        type="button"
        aria-label="Close image"
        class="absolute right-2 top-2 flex size-10 items-center justify-center rounded-full bg-black/65 text-xl text-white"
        onclick={closeImage}
      >
        ×
      </button>
    </div>
  </div>
{/if}
