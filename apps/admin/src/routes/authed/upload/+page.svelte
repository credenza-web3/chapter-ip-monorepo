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

<div class="p-10 min-h-xl card bg-base-100 shadow-md rounded-3xl">
  <div class="mb-12 text-left">
    <h1 class="text-2xl font-semibold text-[#202225]">Upload</h1>
  </div>

  <div class="mt-6 flex flex-col border-b-2 border-dashed border-gray-300 pb-6 w-1/2">
    <h2 class="font-semibold mb-3">Details</h2>

    <input
      id="title"
      type="text"
      bind:value={$uploadStore.title}
      placeholder="Title"
      class="input w-full mb-3 focus:border-[#988cff] focus:outline-none focus:ring-0"
    />
    <textarea
      id="description"
      bind:value={$uploadStore.description}
      placeholder="Description"
      class="input w-full mb-3 h-25 py-2 px-3 focus:border-[#988cff] focus:outline-none focus:ring-0"
    ></textarea>
    <ImageUpload />
  </div>
  <FileUpload />

  <div class="mt-8 space-y-4">
    <LicenseForm />

    <div class="flex gap-10 mt-10">
      <button
        class="btn btn-outline w-55 text-white bg-[#6e4ff7] disabled:bg-[#f9fafb] disabled:text-black/10 disabled:border-[#6e4ff7]/20"
        onclick={onSubmitClick}
        disabled={$uploadStore.loading || !$isFormValid || !$uploadStore.uploaded}
      >
        {#if $uploadStore.loading}
          <div class="loading loading-spinner"></div>
        {:else}
          Upload file
        {/if}
      </button>
    </div>
  </div>
</div>
