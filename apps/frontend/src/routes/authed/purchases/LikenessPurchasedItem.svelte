<script lang="ts">
  import { downloadZip } from 'client-zip'
  import { showSaveFilePicker } from 'native-file-system-adapter'
  import mime from 'mime'

  import type { LikenessDetails } from '@repo/content-types/likeness'
  import LikenessLicenseModal from './LikenessLicenseModal.svelte'
  import type { ContentFilesLinkClient, PurchasedContentToken } from './types'

  type DownloadableContentFile = {
    url: string
    label: string
    mimetype: string
  }

  let {
    purchase,
    likeness,
    trpcClient,
  }: {
    purchase: PurchasedContentToken
    likeness: LikenessDetails
    trpcClient: ContentFilesLinkClient | undefined
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

  function getFilesLinkInput() {
    return {
      contentId: purchase.id,
      ...(purchase.licenseTokenId ? { licenseTokenId: purchase.licenseTokenId } : {}),
    }
  }

  async function* fileStreamGenerator(files: DownloadableContentFile[]) {
    for (const file of files) {
      try {
        const response = await fetch(file.url)
        if (!response.ok) throw new Error(`HTTP ${response.status}`)

        yield {
          name: `${file.label}.${mime.getExtension(file.mimetype) ?? 'bin'}`,
          input: response.body!,
        }
      } catch (error) {
        console.error(`Skipping ${file.label}:`, error)
      }
    }
  }

  async function downloadAllNativeStreaming(files: DownloadableContentFile[]) {
    let fileHandle
    try {
      fileHandle = await showSaveFilePicker({
        suggestedName: `${likeness.name}.zip`,
        types: [
          {
            description: 'ZIP Archive',
            accept: { 'application/zip': ['.zip'] },
          },
        ],
      })
    } catch {
      console.log('User cancelled the save dialog.')
      return
    }

    const writableStream = await fileHandle.createWritable()

    try {
      const zipResponse = downloadZip(fileStreamGenerator(files))
      if (!zipResponse.body) throw new Error('Streams are not supported')
      await zipResponse.body.pipeTo(writableStream)
    } catch (err) {
      console.error('Download failed:', err)
    }
  }

  async function downloadFiles() {
    if (!canDownload) return

    errorMessage = ''
    isDownloading = true
    try {
      if (!trpcClient) throw new Error('Missing TRPC client')

      const { files } = await trpcClient.contents.getContentAllFilesLink.query(getFilesLinkInput())
      if (!files.length) throw new Error('No content files available')

      await downloadAllNativeStreaming(files)

      if (purchase.licenseType === '2') isBlocked = true
    } catch (error) {
      console.error('Error downloading content files:', error)
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
      onclick={downloadFiles}
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
