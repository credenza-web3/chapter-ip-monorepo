<script lang="ts">
  import { goto } from '$app/navigation'
  import { onMount } from 'svelte'
  import { loadRecentFiles } from './helper'
  import CodeImg from '$lib/assets/code.svg'

  interface RecentFile {
    id: string
    title: string
    description: string
    image?: string
    openedAt: string
  }

  let recentFiles = $state<RecentFile[]>([])

  onMount(() => {
    recentFiles = loadRecentFiles()
  })
</script>

{#if recentFiles.length > 0}
  <div class="mt-12 mb-6">
    <div class="flex gap-2.5 items-center mb-2.5">
      <h2 class="text-[18px] xfont-semibold">Recents</h2>
      <img src={CodeImg} alt="" class="" />
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      {#each recentFiles as file (file.id)}
        <div
          class="card bg-white border border-red-50 cursor-pointer flex flex-row rounded-md"
          role="button"
          tabindex="0"
          onclick={() => goto(`/authed/files/${file.id}`)}
          onkeydown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              goto(`/authed/files/${file.id}`)
            }
          }}
        >
          <div class="w-25 h-25 m-5 flex items-center justify-center rounded-md">
            {#if file.image}
              <img src={file.image.replace('+xml', '')} alt={file.title} class="w-full h-full object-contain" />
            {:else}
              <div class="text-gray-400 rounded-md flex items-center justify-center w-full h-full">
                <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            {/if}
          </div>
          <div class="p-4">
            <h3 class="card-title text-base font-semibold truncate mb-1">{file.title}</h3>
            <p class="text-sm text-[#707070] line-clamp-3">
              {file.description || 'No description available'}
            </p>
          </div>
        </div>
      {/each}
    </div>
  </div>
{/if}
