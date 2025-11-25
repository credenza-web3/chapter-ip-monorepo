<script lang="ts">
  import '../app.css'
  import favicon from '$lib/assets/credenza.png'
  import { Toast, Header } from '@repo/ui-components'
  import { authStore } from '$lib'

  let { children } = $props()
  const menuItems = [
    { label: 'Files', href: '/authed/files' }
  ]
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <title>chapter ip</title>
</svelte:head>
<Toast />
<Header {authStore} {menuItems}/>
<div class="min-h-screen overflow-x-hidden flex flex-col">
  <main class="space-y-0 flex-1">
    {@render children?.()}
  </main>
</div>
