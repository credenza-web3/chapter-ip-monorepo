<script lang="ts">
  import ImageLightbox from './ImageLightbox.svelte'
  import LikenessMediaGrid from './LikenessMediaGrid.svelte'
  import LikenessProfileDetails from './LikenessProfileDetails.svelte'
  import LicenseSelection from './LicenseSelection.svelte'
  import PermittedUses from './PermittedUses.svelte'
  import type { LikenessPurchase } from './types'

  let { purchase }: { purchase: LikenessPurchase } = $props()

  let selectedImage = $state<LikenessPurchase['images'][number] | null>(null)
  let selectedLicenseId = $state('')

  $effect(() => {
    if (!selectedLicenseId && purchase.licenses[0]) selectedLicenseId = purchase.licenses[0].id
  })
</script>

<article
  class="mx-auto w-full max-w-293.75 rounded-3xl border border-[#1a1a2e0d] bg-[#f8f5f1] px-5 py-10 sm:px-10 sm:py-12 lg:px-25 lg:pt-12.25 lg:pb-16"
>
  <header class="max-w-237.5">
    <h1 class="font-heading text-2xl leading-7.25 font-semibold text-dark">{purchase.name}</h1>
    <p class="mt-2.75 whitespace-pre-line text-base leading-7 text-[#72717b]">
      {purchase.bio || 'No biography provided.'}
    </p>
  </header>

  <div class="mt-12.5 grid gap-12 lg:grid-cols-[400px_minmax(0,515px)] lg:gap-8.75">
    <LikenessProfileDetails {purchase} onSelectImage={(image) => (selectedImage = image)} />

    <div class="min-w-0">
      <LicenseSelection
        licenses={purchase.licenses}
        {selectedLicenseId}
        onSelect={(licenseId) => (selectedLicenseId = licenseId)}
      />
      <PermittedUses uses={purchase.permittedUses} />
    </div>
  </div>

  <LikenessMediaGrid images={purchase.images} onSelectImage={(image) => (selectedImage = image)} />
</article>

{#if selectedImage}
  <ImageLightbox image={selectedImage} onClose={() => (selectedImage = null)} />
{/if}
