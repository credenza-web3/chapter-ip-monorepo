<script lang="ts">
  import type { LikenessDetails } from '@repo/content-types/likeness'
  import LikenessLicenseModal from './LikenessLicenseModal.svelte'
  import type { ContentFileLinkClient, PurchasedContentToken } from './types'

  let {
    purchase,
    likeness,
    trpcClient,
  }: {
    purchase: PurchasedContentToken
    likeness: LikenessDetails
    trpcClient: ContentFileLinkClient | undefined
  } = $props()

  let isBlocked = $state(false)
  let initializedLicenseTokenId = $state('')
  let isDownloading = $state(false)
  let isModalOpen = $state(false)
  let errorMessage = $state('')

  const primaryImage = $derived(likeness.images[0])
  const byline = $derived(`by ${likeness.stageName || likeness.name}`)
  const modalTitleId = $derived(`likeness-license-${purchase.licenseTokenId}`)
  const canDownload = $derived(!isBlocked && !isDownloading)

  $effect(() => {
    if (initializedLicenseTokenId === purchase.licenseTokenId) return

    isBlocked = purchase.isBlocked
    initializedLicenseTokenId = purchase.licenseTokenId
  })

  function getFileLinkInput() {
    const file = purchase.files?.[0]
    const key = typeof file?.key === 'string' ? file.key : ''
    const metadataKey =
      'key' in purchase.metadata && typeof purchase.metadata.key === 'string' ? purchase.metadata.key : ''

    return {
      ...(purchase.licenseTokenId ? { licenseTokenId: purchase.licenseTokenId } : {}),
      ...(file?.id ? { id: file.id } : { key: key || metadataKey }),
    }
  }

  async function downloadFile() {
    if (!canDownload) return

    errorMessage = ''
    isDownloading = true
    try {
      if (!trpcClient) throw new Error('Missing TRPC client')

      const { url } = await trpcClient.contents.getContentFileLink.query(getFileLinkInput())
      window.open(url, '_blank', 'noopener,noreferrer')
      if (purchase.licenseType === '2') isBlocked = true
    } catch (error) {
      console.error('Error fetching file URL:', error)
      errorMessage = 'Download is unavailable right now.'
    } finally {
      isDownloading = false
    }
  }

  function closeModal() {
    isModalOpen = false
  }

  function handleKeydown(event: KeyboardEvent) {
    if (isModalOpen && event.key === 'Escape') closeModal()
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<article
  class="grid gap-4 py-6 md:grid-cols-[160px_minmax(0,1fr)_auto] md:items-center md:gap-6 md:py-8 lg:grid-cols-[168px_minmax(0,1fr)_auto]"
>
  <div class="size-24 overflow-hidden bg-[#1a1a2e] md:size-[160px] lg:size-[168px]">
    <img src={primaryImage.src} alt={primaryImage.alt} class="size-full object-cover" />
  </div>

  <div class="min-w-0">
    <p class="text-xs leading-4 font-semibold tracking-[0.14em] text-primary uppercase">Likeness</p>
    <h2 class="mt-1 truncate font-heading text-xl leading-6 font-semibold text-[#1a1a2e]">{likeness.name}</h2>
    <p class="mt-1 truncate text-sm leading-5 text-[#6d6a73]">{byline}</p>
    {#if isBlocked}
      <p class="mt-2 text-sm leading-5 font-medium text-[#9f2f2f]">Already used</p>
    {:else if errorMessage}
      <p class="mt-2 text-sm leading-5 font-medium text-[#9f2f2f]">{errorMessage}</p>
    {/if}
  </div>

  <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-end md:gap-3">
    <button
      type="button"
      class="btn min-h-11 w-full rounded-none border-primary bg-primary px-5 text-sm font-semibold text-white hover:border-[#5427dc] hover:bg-[#5427dc] md:min-h-[50px] md:w-[188px]"
      onclick={() => (isModalOpen = true)}
    >
      View License
    </button>
    <button
      type="button"
      class="btn min-h-11 w-full rounded-none border-primary bg-white px-5 text-sm font-semibold text-primary hover:border-[#5427dc] hover:bg-[#f5f1ec] md:min-h-[50px] md:w-[188px]"
      disabled={!canDownload}
      onclick={downloadFile}
    >
      {#if isDownloading}
        Downloading
      {:else if isBlocked}
        Already used
      {:else}
        Download
      {/if}
    </button>
  </div>
</article>

{#if isModalOpen}
  <LikenessLicenseModal {likeness} {byline} titleId={modalTitleId} onClose={closeModal} />
{/if}
