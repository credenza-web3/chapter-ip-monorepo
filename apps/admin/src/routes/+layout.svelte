<script lang="ts">
  import Header from '$lib/components/Header.svelte'
<<<<<<< Updated upstream
  import { SvelteToast } from '@zerodevx/svelte-toast'
  import '../app.css'
  import favicon from '$lib/assets/credenza.png'
=======
  import { Test } from '@repo/ui-components'
>>>>>>> Stashed changes

  let { children } = $props()
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <title>chapter ip</title>
</svelte:head>
<SvelteToast />
<div class="min-h-screen overflow-x-hidden flex flex-col">
  <Test />
  <Header />
  <main class="space-y-0 flex-1">
    {@render children?.()}
  </main>
</div>
