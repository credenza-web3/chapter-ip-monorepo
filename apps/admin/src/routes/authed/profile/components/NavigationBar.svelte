<script>
  let { activeTab = $bindable() } = $props()

  const active = 'border-b-2 border-b-[#0f62d0] text-[#0f62d0]'
</script>

<header class="bg-[#F7F7F7] w-full max-w-2xl">
  <nav class="flex gap-12 text-xs font-medium text-dark mx-6.25">
    <button
      type="button"
      class={`cursor-pointer py-3.25 ${activeTab === 'cred' ? active : ''}`}
      onclick={() => (activeTab = 'cred')}
    >
      CRED History
    </button>
  </nav>
</header>
