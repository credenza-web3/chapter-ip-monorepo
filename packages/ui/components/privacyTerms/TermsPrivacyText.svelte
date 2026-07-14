<script lang="ts">
  type ContentItem = string | { title: string; text: string[] }
  type TermsSection = { num?: number; title?: string; content: ContentItem[] }

  let { title, sections }: { title: string; sections: TermsSection[] } = $props()
  let openSections = $state<Set<number>>(new Set())

  function toggleSection(index: number) {
    const nextOpenSections = new Set(openSections)
    if (nextOpenSections.has(index)) {
      nextOpenSections.delete(index)
    } else {
      nextOpenSections.add(index)
    }
    openSections = nextOpenSections
  }
</script>

<div class="max-w-3xl mx-auto py-4 text-gray-800">
  <h1 class="text-3xl font-bold mb-4">{title}</h1>

  <div class="space-y-8">
    {#each sections as section, i}
      <section>
        {#if section.num && section.title}
          <h2 class="mb-2 text-base font-semibold">
            <button
              type="button"
              class="w-full text-left"
              aria-expanded={openSections.has(i)}
              aria-controls={`terms-section-${i}`}
              onclick={() => toggleSection(i)}
            >
              {section.num}. {section.title}
            </button>
          </h2>
        {/if}
        {#if !section.num || openSections.has(i)}
          <div id={`terms-section-${i}`} class="space-y-4">
            {#each section.content as paragraph}
              {#if typeof paragraph === 'string'}
                <p class="text-gray-600 leading-relaxed text-sm">{paragraph}</p>
              {:else}
                <div class="space-y-2 pl-2">
                  <h3 class="text-sm font-semibold">{paragraph.title}</h3>
                  {#each paragraph.text as text}
                    <p class="pl-2">{text}</p>
                  {/each}
                </div>
              {/if}
            {/each}
          </div>
        {/if}
      </section>

      {#if i < sections.length - 1}
        <hr class="border-gray-100" />
      {/if}
    {/each}
  </div>
</div>
