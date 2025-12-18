<script lang="ts">
  import MenuIcon from '../assets/menu_burger_black.svg'
  import Logo from '../assets/credenza.svg'

  let isMenuOpened = $state(false)
  let { menuItems, children } = $props()

  const clientLinkClass =
    'block rounded-md pl-[20px] py-1.5 text-[12px] tracking-[-0.24px] text-[#747f7c] hover:text-[#5a5a5a] hover:bg-[#F7F7F7] w-full'

  const toggleMenu = () => {
    isMenuOpened = !isMenuOpened
  }
</script>

{#snippet MenuBlock(isMobile = false)}
  <div class="flex flex-col gap-1">
    <div class="flex justify-between items-center mb-10">
      <img src={Logo} alt="Credenza" class="w-32" />
      <img src={MenuIcon} alt="Menu Icon" class="w-[100px] h-[20px]" />
    </div>
    {#each menuItems as { label, href }}
      <a {href} class={clientLinkClass} onclick={() => isMobile && (isMenuOpened = false)}>
        {label}
      </a>
    {/each}
  </div>
{/snippet}
<div class="drawer md:drawer-open w-full min-h-screen">
  <input type="checkbox" class="drawer-toggle" bind:checked={isMenuOpened} />

  <div class="drawer-side border-r border-[#e2e9f0] bg-white md:flex hidden flex-col w-[270px] mt-4 pl-6">
    {@render MenuBlock(false)}
  </div>

  <div class="drawer-content flex-1 w-full max-w-full flex flex-col items-center overflow-x-hidden bg-[#F9FAFA]">
    {@render children()}
  </div>

  <button
    class="md:hidden fixed top-[77px] left-4 z-10 p-2 bg-white rounded-md shadow"
    onclick={toggleMenu}
    aria-label="Open menu"
  >
    <img src={MenuIcon} alt="Menu" class="w-6 h-6" />
  </button>

  <div
    class={`fixed top-0 left-0 z-20 w-[270px] h-full bg-white p-6 flex flex-col transition-transform duration-300 md:hidden ${
      isMenuOpened ? 'translate-x-0' : '-translate-x-full'
    }`}
  >
    {@render MenuBlock(true)}
  </div>

  {#if isMenuOpened}
    <button
      type="button"
      class="fixed inset-0 bg-black/30 z-10 md:hidden"
      onclick={() => (isMenuOpened = false)}
      aria-label="Close menu"
    ></button>
  {/if}
</div>
