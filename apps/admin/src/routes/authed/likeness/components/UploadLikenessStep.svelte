<script lang="ts">
  import { likenessStore } from '../stores/likeness-store'
  import ImageUpload from './ImageUpload.svelte'
  import LikenessDetails from './LikenessDetails.svelte'
</script>

<div class="space-y-12 mt-7.25 text-dark">
  <div class="pb-6">
    <h2 class="mb-2 text-[28px] font-medium text-left text-dark">Upload your likeness</h2>
    <p class="mt-3 text-basetext-left text-[#72717b]">
      Describe the asset clearly so the next licensing step has the right context.
    </p>
  </div>

  <div class="space-y-6">
    <h3 class="text-base font-semibold text-left">General Information</h3>
    <label class="block space-y-3">
      <span class="mb-2 block text-sm text-[#71707a]">Full Legal Name<span class="text-[#ff0000] pl-0.5">*</span></span>
      <input
        id="full-legal-name"
        type="text"
        bind:value={$likenessStore.profile.fullLegalName}
        placeholder="Your legal name"
        class="w-full max-w-137.5 h-11.75 bg-white rounded-sm border border-[#ddd4cc] p-3.75 focus:border-primary focus:outline-none
         opacity-0.3 text-sm font-medium text-left text-[#71707a]"
      />
    </label>

    <label class="block space-y-3">
      <span class="mb-2 block text-sm text-[#71707a]">Stage Name</span>
      <input
        id="stage-name"
        type="text"
        bind:value={$likenessStore.profile.stageName}
        placeholder="Your stage name"
        class="w-full max-w-137.5 h-11.75 bg-white rounded-sm border border-[#ddd4cc] p-3.75 focus:border-primary focus:outline-none
         opacity-0.3 text-sm font-medium text-left text-[#71707a]"
      />
    </label>

    <label class="block space-y-3">
      <span class="mb-2 block text-sm text-[#71707a]">Bio<span class="text-[#ff0000] pl-0.5">*</span></span>
      <textarea
        id="bio"
        bind:value={$likenessStore.profile.bio}
        placeholder="Bio"
        class="w-full max-w-137.5 h-25 bg-white rounded-sm border border-[#ddd4cc] p-3.75 focus:border-primary focus:outline-none
         opacity-0.3 text-sm font-medium text-left text-[#71707a]"
      ></textarea>
    </label>
  </div>
  <div class="border-t border-[#ddd] mb-12.25 mx-10"></div>
  <LikenessDetails />
  <div class="border-t border-[#ddd] mb-12.25 mx-10"></div>
  <div>
    <h3 class="text-base font-semibold text-left">Upload assets</h3>
    <p class="mt-3 text-base text-[#72717b]">Upload by dragging files onto the page or clicking to browse.</p>
    <ImageUpload label="Headshots" required={true} fileKey="headshots" mediaKind="image" />
  </div>
  <div class="flex gap-3.25">
    <ImageUpload label="Full body" fileKey="bodyShots" mediaKind="image" />
    <ImageUpload label="Voice samples" fileKey="voiceSamples" mediaKind="audio" />
    <ImageUpload label="Video reels" fileKey="videoReels" mediaKind="video" />
  </div>
  <div class="flex gap-5 justify-center items-center">
    <input type="checkbox" class="checkbox" bind:checked={$likenessStore.confirmations.rightsConfirmed} />
    <p class="text-sm font-medium text-left text-[#747474]">
      By uploading this content, you confirm that you are the author or rights holder and have the legal right to
      license it.<span class="text-[#ff0000] pl-0.5">*</span>
    </p>
  </div>
</div>
