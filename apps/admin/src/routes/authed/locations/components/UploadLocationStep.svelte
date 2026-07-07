<script lang="ts">
  import { locationStore } from '../stores/location-store'

  let {
    currentStep = $bindable(),
    onSaveDraft,
  }: {
    currentStep: number
    onSaveDraft?: () => Promise<void>
  } = $props()

  const canContinueFromStepOne = $derived(
    Boolean(
      $locationStore.name &&
      ($locationStore.files.locations.length || $locationStore.existingFiles.locations.length) &&
      $locationStore.confirmations.rightsConfirmed,
    ),
  )

  let tagInput = $state('')
  let imageInput: HTMLInputElement | null = $state(null)

  function addTag() {
    const tag = tagInput.trim()
    if (tag && !$locationStore.tags.includes(tag)) {
      locationStore.setTags([...$locationStore.tags, tag])
    }
    tagInput = ''
  }

  function removeTag(index: number) {
    locationStore.setTags($locationStore.tags.filter((_, i) => i !== index))
  }

  function handleTagKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  const selectedFiles = $derived($locationStore.files.locations ?? [])
  const existingFiles = $derived($locationStore.existingFiles.locations ?? [])
  const hasMedia = $derived(selectedFiles.length > 0 || existingFiles.length > 0)

  function appendFiles(files: File[]) {
    if (!files.length) return
    locationStore.appendMediaFiles('locations', files)
  }

  function handleFileInput(event: Event) {
    const target = event?.target as HTMLInputElement
    const files = Array.from(target?.files ?? [])
    appendFiles(files)
    target.value = ''
  }

  function handleDragOver(event: DragEvent) {
    event.preventDefault()
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault()
    const files = Array.from(event.dataTransfer?.files ?? [])
    appendFiles(files)
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    imageInput?.click()
  }

  function openFilePicker(e: MouseEvent) {
    e.stopPropagation()
    imageInput?.click()
  }

  function toggleRightsConfirmed() {
    locationStore.setRightsConfirmed(!$locationStore.confirmations.rightsConfirmed)
  }

  function removeFile(e: MouseEvent, index: number) {
    e.stopPropagation()
    locationStore.removeMediaFile('locations', index)
  }

  function removeExisting(e: MouseEvent, index: number) {
    e.stopPropagation()
    locationStore.removeExistingFile('locations', index)
  }
</script>

<div class="space-y-12 mt-7.25 text-dark">
  <!-- Title Section -->
  <div class="pb-6">
    <h2 class="mb-2 text-[28px] font-medium text-left text-dark font-heading">Upload your location</h2>
    <p class="mt-3 text-base text-left text-[#72717b]">
      Add a location to license for AI image, video, and 3D. The details below are what creators see — and what every
      license is anchored to.
    </p>
  </div>

  <!-- General Information -->
  <div class="space-y-6">
    <h3 class="text-base font-semibold text-left text-dark font-heading">General Information</h3>

    <label class="block space-y-3">
      <span class="mb-2 block text-sm text-[#71707a]">Location Name <span class="text-[#ff0000]">*</span></span>
      <input
        type="text"
        bind:value={$locationStore.name}
        placeholder="Location Name"
        class="w-full max-w-137.5 h-11.75 bg-white rounded-sm border border-[#ddd] px-3.75 text-sm font-medium text-[#71707a]
          focus:border-primary focus:outline-none focus:shadow-[0_3px_6px_0_rgba(0,0,0,0.16)] transition-shadow"
      />
    </label>

    <!-- Add address link (visual only) -->
    <button type="button" class="flex items-center gap-2 text-sm text-primary hover:underline">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M7 1V13M1 7H13" stroke="#6734FF" stroke-width="2" stroke-linecap="round" />
      </svg>
      <span>Add address</span>
    </button>

    <label class="block space-y-3">
      <span class="mb-2 block text-sm text-[#71707a]">Description <span class="text-[#ff0000]">*</span></span>
      <textarea
        bind:value={$locationStore.description}
        placeholder="Description"
        class="w-full max-w-137.5 h-25 bg-white rounded-sm border border-[#ddd] px-3.75 py-3 text-sm font-medium text-[#71707a]
          focus:border-primary focus:outline-none resize-none"
      ></textarea>
    </label>
  </div>

  <!-- Dashed divider -->
  <div class="border-t border-dashed border-[#ddd] mx-10"></div>

  <!-- Tags -->
  <div class="space-y-6">
    <h3 class="text-base font-semibold text-left text-dark font-heading">Tags</h3>
    <p class="text-base text-[#72717b] -mt-3">
      Add keywords so creators can find this location — style, setting, era, or standout features.
    </p>

    <div class="space-y-3.5">
      <div class="w-full max-w-137.5">
        <input
          type="text"
          bind:value={tagInput}
          onkeydown={handleTagKeydown}
          placeholder="Tag"
          class="w-full h-11.75 bg-white rounded-sm border border-[#ddd] px-3.75 text-sm font-medium text-[#71707a]
            focus:border-primary focus:outline-none"
        />
      </div>

      <button
        type="button"
        onclick={addTag}
        class="flex items-center gap-2 text-sm text-primary hover:underline mb-[25px]"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 1V13M1 7H13" stroke="#6734FF" stroke-width="2" stroke-linecap="round" />
        </svg>
        <span>Add another tag</span>
      </button>

      {#if $locationStore.tags.length > 0}
        <div class="flex flex-wrap gap-2 mt-3.5">
          {#each $locationStore.tags as tag, i (tag + i)}
            <span
              class="inline-flex items-center gap-1.5 px-3 py-1.5 h-7.25 rounded-full bg-[#eae6e2] border border-[#ddd] text-base font-semibold text-[#202225] opacity-50"
            >
              {tag}
              <button
                type="button"
                onclick={() => removeTag(i)}
                class="text-[#d58b00] hover:text-red-500 transition-colors text-xs leading-none"
                aria-label="Remove tag {tag}"
              >
                ✕
              </button>
            </span>
          {/each}
        </div>
      {/if}
    </div>
  </div>

  <!-- Dashed divider -->
  <div class="border-t border-dashed border-[#ddd] mx-10"></div>

  <!-- Location Media Upload -->
  <div class="space-y-6">
    <h3 class="text-lg font-semibold text-left text-dark font-heading">Location</h3>
    <p class="text-base text-[#72717b] -mt-3">
      Upload a clear image or capture of your location. This is the asset creators license, with provenance baked in.
    </p>

    <div class="space-y-1.25 w-full">
      <span class="text-sm text-[#71707a]">Location <span class="text-[#ff0000]">*</span></span>

      <div
        class="border border-dashed min-h-62.5 rounded-lg border-[#1A1A2E33] p-4 bg-cream flex flex-col items-center justify-center gap-4"
        role="button"
        tabindex="0"
        aria-label="Upload location"
        ondragover={handleDragOver}
        ondrop={handleDrop}
        onkeydown={handleKeyDown}
      >
        {#if hasMedia}
          <div class="w-full flex flex-wrap gap-2 justify-center py-2">
            {#each existingFiles as file, i (`existing-${file.id}`)}
              <div class="relative">
                <img src={file.url} alt={file.name} class="h-20 w-20 rounded object-cover" />
                <button
                  type="button"
                  onclick={(e) => removeExisting(e, i)}
                  class="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white border border-[#ddd] text-[#71707a] hover:text-red-500 flex items-center justify-center text-xs transition-colors"
                  >✕</button
                >
              </div>
            {/each}
            {#each selectedFiles as file, i (file.name + i)}
              <div class="relative">
                <img src={URL.createObjectURL(file)} alt={file.name} class="h-20 w-20 rounded object-cover" />
                <button
                  type="button"
                  onclick={(e) => removeFile(e, i)}
                  class="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white border border-[#ddd] text-[#71707a] hover:text-red-500 flex items-center justify-center text-xs transition-colors"
                  >✕</button
                >
              </div>
            {/each}

            <button
              type="button"
              onclick={openFilePicker}
              class="h-20 w-20 rounded border-2 border-dashed border-[#1A1A2E33] flex items-center justify-center text-3xl text-[#aaa] hover:border-primary hover:text-primary transition-colors"
              >+</button
            >
          </div>
        {:else}
          <p class="text-base font-semibold text-dark">Upload your location</p>
          <button
            type="button"
            onclick={openFilePicker}
            class="w-10.5 h-10.5 rounded-full bg-primary text-white flex items-center justify-center text-4xl hover:opacity-90 transition-opacity"
            >+</button
          >
        {/if}

        <input
          type="file"
          class="hidden"
          bind:this={imageInput}
          onchange={handleFileInput}
          accept="image/*,.mp4,.mov,.webm,.splat,.ply,.obj,.mtl,.glb"
          multiple
        />
      </div>

      <span class="text-[10px] text-right text-[#747474] w-full block">
        .mp4, .mov, .webm, .splat, .ply, .obj, .mtl, .glb files accepted
      </span>
    </div>
  </div>

  <!-- Legal disclaimer -->
  <div class="flex justify-center">
    <label class="flex items-center gap-3 cursor-pointer">
      <button
        type="button"
        onclick={toggleRightsConfirmed}
        class="w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors
          {$locationStore.confirmations.rightsConfirmed ? 'bg-primary border-primary' : 'border-[#ddd] bg-white'}"
      >
        {#if $locationStore.confirmations.rightsConfirmed}
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path
              d="M1 4L3.5 6.5L9 1"
              stroke="white"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        {/if}
      </button>
      <span class="text-sm font-medium text-left text-[#747474]">
        By uploading this content, you confirm that you are the author or rights holder and have the legal right to
        license it.<span class="text-[#ff0000]">*</span>
      </span>
    </label>
  </div>
</div>

<!-- Buttons -->
<div class="flex justify-end gap-1.5 mt-12.5">
  {#if onSaveDraft}
    <button
      class="text-sm font-medium rounded-sm h-9.5 px-7.5 bg-cream border border-[#ddd] disabled:bg-[#e1dddb] text-dark cursor-pointer"
      onclick={onSaveDraft}
      disabled={$locationStore.ui.loading}
    >
      Save as Draft
    </button>
  {/if}
  {#if canContinueFromStepOne}
    <button
      class="text-sm font-medium rounded-sm h-9.5 px-7.5 bg-primary disabled:bg-[#e1dddb] text-cream cursor-pointer"
      onclick={() => (currentStep = 2)}
      disabled={$locationStore.ui.loading}
    >
      Save and Continue
    </button>
  {:else}
    <button class="text-sm font-medium rounded-sm h-9.5 px-7.5 bg-[#e1dddb] text-cream cursor-not-allowed" disabled>
      Save and Continue
    </button>
  {/if}
</div>
