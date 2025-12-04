<script lang="ts">
  import '../app.css'
  import favicon from '$lib/assets/credenza.png'
  import { Toast, Header, Footer } from '@repo/ui-components'
  import { authStore } from '$lib'

  let { children } = $props()
  const menuItems = [
    { label: 'Files', href: '/authed/files' },
    { label: 'Upload', href: '/authed/upload' },
  ]
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <title>chapter ip</title>
</svelte:head>
<Toast />
<div class="min-h-screen overflow-x-hidden flex flex-col">
  <Header {authStore} {menuItems} />
  <main class="space-y-0 flex-1 md:p-6 p-2">
    {@render children?.()}
  </main>
  <Footer />
</div>
