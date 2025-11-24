<script lang="ts">
  import Header from '$lib/components/Header.svelte'
  import { SvelteToast } from '@zerodevx/svelte-toast'
  import '../app.css'
  import favicon from '$lib/assets/credenza.png'

  let { children } = $props()
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <title>chapter ip</title>
</svelte:head>
<SvelteToast />
<div class="min-h-screen overflow-x-hidden flex flex-col">
  <Header />
  <main class="space-y-0 flex-1">
    {@render children?.()}
  </main>
</div>
