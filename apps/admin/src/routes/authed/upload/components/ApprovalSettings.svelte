<script lang="ts">
  import { uploadStore } from '../stores/upload-store'

  const questions = [
    { key: 'allowRetouching', label: 'Allow minor retouching?' },
    { key: 'approveFinalUse', label: 'Approve final use?' },
  ] as const
</script>

<div class="space-y-6">
  {#each questions as question (question.key)}
    <div class="space-y-3">
      <h3 class="text-base font-semibold text-[#1A1A2E]">{question.label} <span class="text-[#ff0000]">*</span></h3>
      <div class="flex gap-6">
        {#each ['yes', 'no'] as option (option)}
          <label class="flex items-center gap-2 cursor-pointer">
            <button
              type="button"
              onclick={() => {
                if (question.key === 'allowRetouching') {
                  uploadStore.setAllowRetouching(option as 'yes' | 'no')
                } else {
                  uploadStore.setApproveFinalUse(option as 'yes' | 'no')
                }
              }}
              class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors
                {$uploadStore.licensing[question.key] === option ? 'border-primary' : 'border-[#ddd4cc]'}"
            >
              {#if $uploadStore.licensing[question.key] === option}
                <span class="w-2.5 h-2.5 rounded-full bg-primary"></span>
              {/if}
            </button>
            <span class="text-sm text-[#1A1A2E] capitalize">{option}</span>
          </label>
        {/each}
      </div>
    </div>
  {/each}
</div>
