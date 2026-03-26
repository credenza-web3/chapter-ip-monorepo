<script lang="ts">
  import Logo from '../assets/credenza-min.svg'

  const links = [
    { url: 'https://www.credenza3.com', text: 'Credenza' },
    { url: 'https://www.credenza3.com/company/about', text: 'About' },
    { url: 'mailto:info@credenza3.com', text: 'Contact' },
    { url: '/privacy-terms', text: 'Privacy & Terms' },
  ]
</script>

<footer class="flex flex-col items-center justify-center">
  <div class="mb-4 flex flex-col items-center gap-1">
    <img src={Logo} alt="Credenza Logo" width="119" class="h-6" />
    <span class="text-xs">Powered by Credenza</span>
  </div>
  <div class="flex mb-4">
    {#each links as link, i}
      {#if i > 0}<p class="mx-1">·</p>{/if}
      <p>
        <a
          class="text-sm hover:underline"
          href={link.url}
          target={link.url.startsWith('/') ? undefined : '_blank'}
          rel="noreferrer"
        >
          {link.text}
        </a>
      </p>
    {/each}
  </div>
</footer>
