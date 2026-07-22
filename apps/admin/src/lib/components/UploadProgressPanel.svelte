<script lang="ts">
  import type { UploadProgressEvent } from '$lib/upload/upload.service'

  let { progress }: { progress: UploadProgressEvent } = $props()

  const phaseLabels: Record<UploadProgressEvent['phase'], string> = {
    uploading: 'Uploading files…',
    minting: 'Minting on blockchain…',
    finalizing: 'Finalizing content…',
    'saving-metadata': 'Saving metadata…',
  }

  const clampPercent = (value: number) => Math.min(100, Math.max(0, Math.round(value)))

  const phaseLabel = $derived(phaseLabels[progress.phase])
  const overallPercent = $derived(clampPercent(progress.overallProgress * 100))
  const filePercent = $derived(clampPercent((progress.progress ?? 0) * 100))
  const showPerFile = $derived(
    progress.phase === 'uploading' && (progress.fileCount ?? 0) > 1 && Boolean(progress.fileName),
  )
</script>

<div class="rounded-lg border border-[#ddd4cc] bg-cream p-4">
  <div class="mb-2 flex items-center justify-between gap-3 text-sm">
    <span class="font-medium text-dark">{phaseLabel}</span>
    {#if progress.phase === 'uploading'}
      <span class="shrink-0 text-[#72717b]">{overallPercent}%</span>
    {/if}
  </div>

  <progress class="progress progress-primary w-full" value={overallPercent} max="100"></progress>

  {#if showPerFile}
    <div class="mt-3 text-sm">
      <div class="mb-1 flex items-center justify-between gap-3 text-[#72717b]">
        <span class="truncate">{progress.fileName}</span>
        <span class="shrink-0">{filePercent}%</span>
      </div>
      <progress class="progress progress-primary h-2 w-full" value={filePercent} max="100"></progress>
    </div>
  {/if}
</div>
