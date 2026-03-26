<script>
  let { title, sections } = $props()
</script>

<div class="max-w-3xl mx-auto py-4 text-gray-800">
  <h1 class="text-3xl font-bold mb-1">{title}</h1>
  <p class="text-sm text-gray-400 mb-8">Chapter IP Corp</p>

  <div class="space-y-8">
    {#each sections as section, i}
      <section>
        {#if section.num}
          <h2 class="text-base font-semibold mb-2">
            {section.num}. {section.title}
          </h2>
        {/if}
        <div class="space-y-4">
          {#each section.content as paragraph}
            {#if typeof paragraph === 'string'}
              <p class="text-gray-600 leading-relaxed text-sm">{paragraph}</p>
            {:else if typeof paragraph === 'object'}
              <div class="space-y-2 pl-2">
                <h2 class="text-sm font-semibold">{paragraph.title}</h2>
                {#each paragraph.text as text}
                  <p class="pl-2">{text}</p>
                {/each}
              </div>
            {/if}
          {/each}
        </div>
      </section>

      {#if i < sections.length - 1}
        <hr class="border-gray-100" />
      {/if}
    {/each}
  </div>
</div>
