<script lang="ts">
  import davinciUrl from '$lib/assets/Davinci.png'
  import flowithUrl from '$lib/assets/flowith.png'
  import lumaUrl from '$lib/assets/Luma.png'
  import runwayUrl from '$lib/assets/runway.png'

  const PLATFORMS = [
    { name: 'DaVinci', src: davinciUrl },
    { name: 'Luma', src: lumaUrl },
    { name: 'Runway', src: runwayUrl },
    { name: 'Flowith', src: flowithUrl },
  ] as const

  let {
    headingId,
    headingClass = 'font-sans text-base leading-5.25 font-semibold text-[#202225]',
    class: className = '',
    gridClass = 'mt-4 grid grid-cols-2 gap-3 sm:max-w-md',
  }: {
    headingId?: string
    headingClass?: string
    class?: string
    gridClass?: string
  } = $props()
</script>

{#if headingId}
  <section aria-labelledby={headingId} class={className}>
    <h2 id={headingId} class={headingClass}>Compatible with</h2>
    <div class={gridClass}>
      {#each PLATFORMS as platform (platform.name)}
        <img src={platform.src} alt={platform.name} class="w-full object-contain" />
      {/each}
    </div>
  </section>
{:else}
  <section aria-label="Compatible platforms" class={className}>
    <h3 class={headingClass}>Compatible with</h3>
    <div class={gridClass}>
      {#each PLATFORMS as platform (platform.name)}
        <img src={platform.src} alt={platform.name} class="w-full object-contain" />
      {/each}
    </div>
  </section>
{/if}
