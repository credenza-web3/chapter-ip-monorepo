<script lang="ts">
  import Header from '$lib/components/Header.svelte'
  import '../app.css'
  import favicon from '$lib/assets/credenza.png'
  import { Test, Toast } from '@repo/ui-components'
  import { onMount } from 'svelte'

  let { children } = $props()
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <title>chapter ip</title>
</svelte:head>
<Toast />
<div class="min-h-screen overflow-x-hidden flex flex-col">
  <Test />
  <Header />
  <main class="space-y-0 flex-1">
    {@render children?.()}
  </main>
</div>
