<script lang="ts">
  import Header from "$lib/components/Header.svelte";

  let { children } = $props();
</script>

<svelte:head>
  <title>chapter ip</title>
</svelte:head>

<div class="min-h-screen overflow-x-hidden flex flex-col">
  <Header />
  <main class="space-y-0 flex-1">
    {@render children?.()}
  </main>
</div>
