<script lang="ts">
  import { afterNavigate, beforeNavigate, goto } from '$app/navigation'
  import { notify, ToastType } from '@repo/ui-components'
  import { UploadService } from './services/upload.service'
  import { uploadStore, isFormValid } from './stores/upload-store'
  import FileUpload from './components/FileUpload.svelte'
  import ImageUpload from './components/ImageUpload.svelte'
  import LicenseForm from './components/LicenseForm.svelte'

  const uploadService = new UploadService()

  beforeNavigate(() => uploadStore.setLoading(true))
  afterNavigate(() => uploadStore.setLoading(false))

  const onSubmitClick = async () => {
    if (!$uploadStore.uploaded) {
      notify('No file selected', ToastType.FAIL)
      return
    }

    try {
      uploadStore.setLoading(true)
      const trpcClient = uploadService.createTrpcClient()

      const { tokenId, imageUrl, key } = await uploadService.uploadContent(
        $uploadStore.uploaded!,
        $uploadStore.uploadedImage,
        $uploadStore.lifetimePrice,
        $uploadStore.oneTimePrice,
        trpcClient,
      )

      await uploadService.saveMetadata({
        tokenId,
        uploaded: $uploadStore.uploaded!,
        imageUrl,
        key,
        title: $uploadStore.title,
        description: $uploadStore.description,
        trpcClient,
      })

      notify('File uploaded successfully', ToastType.SUCCESS)
      uploadStore.reset()
      goto('/authed/files')
    } catch (error) {
      console.error('Error uploading file:', error)
      let errorMessage = 'Failed to upload file.'
      if (error instanceof Error && error.message.includes('duplicate key error')) {
        errorMessage = errorMessage + ' This file already exists.'
      }
      notify(errorMessage, ToastType.FAIL)
    } finally {
      uploadStore.setLoading(false)
    }
  }
</script>

<div class="p-6 min-h-xl card bg-base-100 shadow-md">
  <div class="mb-12 text-center">
    <h1 class="text-4xl font-light text-gray-900">Upload Text (TXT/DOCX), Location (MOV/MP4), or NIL (ZIP) File</h1>
  </div>

  <FileUpload />

  {#if $uploadStore.uploaded}
    <div class="mt-6">
      <h2 class="text-xl font-semibold mb-3">Content Details</h2>

      <input
        id="title"
        type="text"
        bind:value={$uploadStore.title}
        placeholder="Title"
        class="input input-bordered w-1/3 mb-3"
      />
      <input
        id="description"
        type="text"
        bind:value={$uploadStore.description}
        placeholder="Description"
        class="input input-bordered w-1/3 mb-3"
      />
      <ImageUpload />
    </div>
    <div class="mt-6 space-y-4">
      <LicenseForm />

      <div class="flex gap-10 mt-3">
        <button
          class="btn btn-outline"
          onclick={onSubmitClick}
          disabled={$uploadStore.loading}
          class:hidden={!$isFormValid}
        >
          {#if $uploadStore.loading}
            <div class="loading loading-spinner"></div>
          {:else}
            Upload
          {/if}
        </button>
      </div>
    </div>
  {/if}
</div>
