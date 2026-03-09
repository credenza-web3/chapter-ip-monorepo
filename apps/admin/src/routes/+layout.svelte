<script lang="ts">
  import '../app.css'
  import favicon from '$lib/assets/credenza.png'
  import { Toast, Header, Footer } from '@repo/ui-components'
  import { authStore } from '$lib'
  import dashboardIcon from '$lib/assets/dashboard.svg'
  import uploadIcon from '$lib/assets/upload.svg'
  import { publisherStore } from '$lib/stores/publisher.svelte'

  let { children } = $props()
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <title>chapter ip</title>
</svelte:head>
<Toast />
<div class="min-h-screen overflow-x-hidden flex flex-col bg-[#f9fafb] text-[#202225]">
  <Header {authStore}>
    <div class="flex items-center w-full justify-between pl-15 pr-5">
      <div>
        <a href="/authed/files" class="flex py-4 px-8 bg-[#e4e8eb] gap-3 font-semibold">
          <img src={dashboardIcon} alt="Dashboard" class="w-[22px]" />
          Dashboard
        </a>
      </div>

      <div class="flex items-center gap-4">
        <a href="/authed/upload" class="text-[#6e4ff7] flex py-4 px-8 gap-3 font-semibold">
          <img src={uploadIcon} alt="Upload" class="w-[26px]" />
          Upload
        </a>
        <a
          href="/authed/profile"
          class="flex items-center justify-center rounded-full bg-[#6e4ff7] text-white font-semibold w-7 h-7"
        >
          {publisherStore.title?.slice(0, 1)?.toUpperCase() || 'U'}
        </a>
      </div>
    </div>
  </Header>
  <main class="space-y-0 flex-1 p-6">
    {@render children?.()}
  </main>
  <Footer />
</div>
