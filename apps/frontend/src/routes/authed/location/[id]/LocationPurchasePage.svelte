<script lang="ts">
  import ImageLightbox from '$lib/content/ImageLightbox.svelte'
  import { canPurchaseLicense, purchaseLicense } from '$lib/content/purchaseLicense'
  import { COMPATIBLE_PLATFORMS } from '@repo/content-types/location'
  import type { LocationDetails } from './types'

  let { locationDetails }: { locationDetails: LocationDetails } = $props()

  let showLightbox = $state(false)
  let selectedLicenseId = $state('')
  let purchasePending = $state(false)

  const selectedLicense = $derived(locationDetails.licenses.find((license) => license.id === selectedLicenseId))
  const purchaseDisabled = $derived(purchasePending || !canPurchaseLicense(locationDetails, selectedLicense))
  const byline = $derived(locationDetails.authorName ? `by ${locationDetails.authorName}` : '')

  $effect(() => {
    if (!selectedLicenseId && locationDetails.licenses[0]) selectedLicenseId = locationDetails.licenses[0].id
  })

  async function handlePurchase() {
    if (!selectedLicense || purchaseDisabled) return

    purchasePending = true
    try {
      await purchaseLicense({ purchase: locationDetails, license: selectedLicense })
    } finally {
      purchasePending = false
    }
  }
</script>

<article
  class="mx-auto w-full max-w-293.75 rounded-3xl border border-[#1a1a2e0d] bg-[#f8f5f1] px-5 py-10 sm:px-10 sm:py-12 lg:px-25 lg:pt-12.25 lg:pb-16"
>
  <header class="max-w-237.5">
    <h1 class="font-heading text-2xl leading-7.25 font-semibold text-dark">{locationDetails.name}</h1>
    {#if byline}
      <p class="mt-1 text-xs leading-4.5 font-medium text-[#747474]">{byline}</p>
    {/if}
    <p class="mt-2.75 whitespace-pre-line text-base leading-7 text-[#72717b]">
      {locationDetails.description || 'No description provided.'}
    </p>
  </header>

  <div class="mt-12.5 grid gap-12 lg:grid-cols-[400px_minmax(0,515px)] lg:gap-8.75">
    <div class="min-w-0">
      <section aria-label="Location preview" class="relative">
        <button
          type="button"
          class="relative block aspect-[400/216] w-full overflow-hidden bg-[#202225]"
          aria-label={`Enlarge ${locationDetails.image.alt}`}
          onclick={() => (showLightbox = true)}
        >
          <img src={locationDetails.image.src} alt={locationDetails.image.alt} class="size-full object-cover" />
          <span
            class="absolute top-2.75 right-2.75 flex size-3 items-center justify-center text-[#cecbc8]"
            aria-hidden="true"
          >
            <svg viewBox="0 0 12 12" class="size-3" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 4V1h3M8 1h3v3M11 8v3H8M4 11H1V8" />
            </svg>
          </span>
        </button>
      </section>

      {#if locationDetails.tags.length > 0}
        <ul class="mt-5 flex flex-wrap gap-2" aria-label="Location tags">
          {#each locationDetails.tags as tag (tag)}
            <li
              class="rounded-[14.5px] border border-[#1a1a2e1a] bg-[#f8f5f1] px-6 py-1 text-base leading-5.25 font-semibold text-[#202225]/50"
            >
              {tag}
            </li>
          {/each}
        </ul>
      {/if}

      <section aria-labelledby="compatible-heading" class="mt-8.75">
        <h2 id="compatible-heading" class="font-sans text-base leading-5.25 font-semibold text-[#202225]">
          Compatible with
        </h2>
        <div class="mt-4 grid grid-cols-2 gap-3 sm:max-w-md">
          {#each COMPATIBLE_PLATFORMS as platform (platform)}
            <div
              class="flex h-11 items-center justify-center rounded-3xl border border-[#1a1a2e1a] bg-white px-4 text-sm font-semibold text-[#202225]"
            >
              {platform}
            </div>
          {/each}
        </div>
      </section>
    </div>

    <div class="min-w-0">
      <section aria-labelledby="licensing-heading">
        <h2 id="licensing-heading" class="font-sans text-base leading-5.25 font-semibold text-[#202225]">
          Licensing Types
        </h2>
        {#if locationDetails.licenses.length > 0}
          <div class="mt-6.25">
            {#each locationDetails.licenses as license (license.id)}
              <label
                class={`relative flex min-h-27.5 cursor-pointer gap-2.5 rounded-md border px-3.75 py-3.5 font-sans transition-colors ${
                  selectedLicenseId === license.id ? 'border-primary bg-[#f5f1ec]' : 'border-[#1a1a2e1a] bg-[#f5f1ec]'
                }`}
              >
                <input
                  type="radio"
                  name="license"
                  value={license.id}
                  checked={selectedLicenseId === license.id}
                  onchange={() => (selectedLicenseId = license.id)}
                  class="peer sr-only"
                />
                <span
                  class={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border bg-[#f8f5f1] ${
                    selectedLicenseId === license.id ? 'border-primary' : 'border-[#1a1a2e1a]'
                  }`}
                  aria-hidden="true"
                >
                  <span
                    class={`size-2.5 rounded-full bg-primary ${
                      selectedLicenseId === license.id ? 'opacity-100' : 'opacity-0'
                    }`}
                  ></span>
                </span>
                <span class="min-w-0 flex-1">
                  <span class="flex items-start justify-between gap-4">
                    <span class="font-semibold leading-5.25 text-[#202225]">{license.name}</span>
                    <span class="shrink-0 font-semibold leading-5.25 text-[#202225]">${license.price}</span>
                  </span>
                  {#if license.description}
                    <span class="mt-2 block text-sm leading-5.25 font-medium text-[#747474]">{license.description}</span
                    >
                  {/if}
                </span>
              </label>
            {/each}
          </div>
        {:else}
          <p class="mt-2 text-[#747474]">No licensing options are currently available.</p>
        {/if}
      </section>

      {#if selectedLicense}
        <button
          disabled={purchaseDisabled}
          onclick={handlePurchase}
          class={`mt-5.5 h-13 w-full rounded-[4px] px-5 font-heading text-base font-medium transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
            purchaseDisabled
              ? 'cursor-not-allowed bg-[#e1dddb] text-[#f5f1ec]'
              : 'bg-primary text-cream hover:opacity-90'
          }`}
        >
          {purchasePending ? 'Processing...' : 'Purchase'}
        </button>
      {/if}
    </div>
  </div>
</article>

{#if showLightbox}
  <ImageLightbox
    image={locationDetails.image}
    dialogLabel="Enlarged location image"
    onClose={() => (showLightbox = false)}
  />
{/if}
