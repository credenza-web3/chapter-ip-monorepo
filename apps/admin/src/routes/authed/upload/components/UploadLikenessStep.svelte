<script lang="ts">
  import { uploadStore } from '../stores/upload-store'
  import FileUpload from './FileUpload.svelte'
  import ImageUpload from './ImageUpload.svelte'
</script>

<div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
  <div class="space-y-6">
    <section class="rounded-[28px] border border-[#e6dfd8] bg-white p-6 shadow-sm">
      <div class="mb-6">
        <h2 class="mb-2 text-lg font-semibold text-dark">Likeness details</h2>
        <p class="text-sm text-[#6f655d]">
          Describe the asset clearly so the next licensing step has the right context.
        </p>
      </div>

      <div class="space-y-4">
        <label class="block">
          <span class="mb-2 block text-sm font-medium text-dark">Title</span>
          <input
            id="title"
            type="text"
            bind:value={$uploadStore.title}
            placeholder="Studio portrait of..."
            class="input h-13 w-full rounded-2xl border border-[#ddd4cc] bg-[#fcfaf8] px-4 focus:border-primary focus:outline-none focus:ring-0"
          />
        </label>

        <label class="block">
          <span class="mb-2 block text-sm font-medium text-dark">Description</span>
          <textarea
            id="description"
            bind:value={$uploadStore.description}
            placeholder="Add usage notes, scene details, wardrobe, or anything helpful for future licensing."
            class="w-full rounded-2xl border border-[#ddd4cc] bg-[#fcfaf8] px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-0"
            rows="5"
          ></textarea>
        </label>
      </div>
    </section>

    <section class="rounded-[28px] border border-[#e6dfd8] bg-white p-6 shadow-sm">
      <ImageUpload />
    </section>

    <section class="rounded-[28px] border border-[#e6dfd8] bg-white p-6 shadow-sm">
      <div class="mb-4">
        <h2 class="mb-2 text-lg font-semibold text-dark">Source file</h2>
        <p class="text-sm text-[#6f655d]">Upload the original content package that should be minted and listed.</p>
      </div>
      <FileUpload />
    </section>
  </div>

  <aside class="rounded-[28px] border border-[#e6dfd8] bg-[#f8f4ef] p-6 shadow-sm">
    <div class="mb-6">
      <div class="mb-2 text-[11px] uppercase tracking-[0.18em] text-[#8f8378]">Preview</div>
      <h2 class="text-lg font-semibold text-dark">Submission summary</h2>
    </div>

    <div class="space-y-4 text-sm text-[#4f463f]">
      <div class="rounded-2xl bg-white p-4">
        <div class="mb-1 text-xs uppercase tracking-[0.12em] text-[#8f8378]">Title</div>
        <div class="font-medium text-dark">{$uploadStore.title || 'Untitled likeness'}</div>
      </div>

      <div class="rounded-2xl bg-white p-4">
        <div class="mb-1 text-xs uppercase tracking-[0.12em] text-[#8f8378]">Description</div>
        <div class="line-clamp-5 min-h-16">{$uploadStore.description || 'No description yet.'}</div>
      </div>

      <div class="rounded-2xl bg-white p-4">
        <div class="mb-1 text-xs uppercase tracking-[0.12em] text-[#8f8378]">Cover image</div>
        <div>{$uploadStore.uploadedImage ? $uploadStore.uploadedImage.name : 'Optional, not selected yet'}</div>
      </div>

      <div class="rounded-2xl bg-dark p-4 text-white">
        <div class="mb-1 text-xs uppercase tracking-[0.12em] text-white/60">Source file</div>
        <div class="font-medium">{$uploadStore.uploaded ? $uploadStore.uploaded.name : 'No file selected yet'}</div>
      </div>
    </div>
  </aside>
</div>
