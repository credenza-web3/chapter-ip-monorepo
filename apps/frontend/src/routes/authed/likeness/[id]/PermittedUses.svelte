<script lang="ts">
  let { uses }: { uses: string[] } = $props()

  const permittedUseDescriptions: Record<string, string> = {
    'AI Training':
      'Use of your likeness as training data for generative AI models. Every model trained on your data is logged on-chain, and you earn royalties on the outputs it produces.',
    Digital: 'Web, social, streaming, in-app, and any other screen-based placement that lives online.',
    Marketing: 'Advertising, brand campaigns, sponsorships, and any use tied to the sale of a product or service.',
    'Film/TV': 'Scripted, unscripted, and documentary productions for theatrical, broadcast, or streaming release.',
  }
</script>

{#if uses.length > 0}
  <section aria-labelledby="uses-heading" class="mt-8.5 border-t border-[#1a1a2e1a] pt-8.75">
    <h2 id="uses-heading" class="font-sans text-base leading-5.25 font-semibold text-[#202225]">Permitted Uses</h2>
    <ul class="mt-5 space-y-7">
      {#each uses as use (use)}
        <li class="grid grid-cols-[14px_1fr] gap-x-2.75">
          <svg aria-hidden="true" class="mt-1.25 h-2.75 w-3.5 text-primary" viewBox="0 0 14 11" fill="none">
            <path d="M1 5.5 5 9.5 13 1.5" stroke="currentColor" stroke-width="2"></path>
          </svg>
          <div class="min-w-0">
            <h3 class="font-sans text-base leading-5.25 font-semibold text-[#202225]">{use}</h3>
            {#if permittedUseDescriptions[use]}
              <p class="mt-2 text-sm leading-5.25 font-medium text-[#747474]">
                {permittedUseDescriptions[use]}
              </p>
            {/if}
          </div>
        </li>
      {/each}
    </ul>
  </section>
{/if}
