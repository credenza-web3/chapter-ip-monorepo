<script>
  let { activeTab = $bindable() } = $props();

  const active = 'border-b-2 border-b-[#0f62d0] text-[#0f62d0]';
</script>

<header class="bg-[#F7F7F7] w-full">
  <nav class="flex gap-12 text-xs font-medium text-[#202225] mx-6.25">
    <button
      type="button"
      class={`cursor-pointer py-3.25 ${activeTab === 'cred' ? active : ''}`}
      onclick={() => (activeTab = 'cred')}
    >
      CRED History
    </button>

    <button
      type="button"
      class={`cursor-pointer py-3.25 ${activeTab === 'contentNft' ? active : ''}`}
      onclick={() => (activeTab = 'contentNft')}
    >
      Content NFT History
    </button>
    <button
      type="button"
      class={`cursor-pointer py-3.25 ${activeTab === 'licenseNft' ? active : ''}`}
      onclick={() => (activeTab = 'licenseNft')}
    >
      License NFT History
    </button>
  </nav>
</header>