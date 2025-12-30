<script lang="ts">
  import MenuIcon from '../assets/menu_burger_black.svg'
  import Logo from '../assets/credenza.svg'

  let isMenuOpened = $state(false)
  let { menuItems, children } = $props()

  const clientLinkClass =
    'block rounded-md pl-[20px] py-1.5 text-[12px] tracking-[-0.24px] text-[#747f7c] hover:text-[#5a5a5a] hover:bg-[#F7F7F7] w-full'

  const closeMenu = () => {
    isMenuOpened = false
  }

  const toggleMenu = () => {
    isMenuOpened = !isMenuOpened
  }
</script>

{#snippet MenuBlock(isMobile = false)}
  <div class="flex flex-col gap-1">
    <div class="flex justify-between items-center mb-10">
      <img src={Logo} alt="Credenza" class="w-32" />
      {#if isMobile}
        <button onclick={closeMenu} class="p-1 hover:bg-gray-100 rounded" aria-label="Close menu">
          <img src={MenuIcon} alt="Close" class="w-6 h-6" />
        </button>
      {/if}
    </div>
    {#each menuItems as { label, href }}
      <a {href} class={clientLinkClass} onclick={() => isMobile && closeMenu()}>
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
    <button
      class="md:hidden fixed top-[77px] left-4 z-10 p-2 bg-white rounded-md shadow"
      onclick={toggleMenu}
      aria-label="Open menu"
    >
      <img src={MenuIcon} alt="Menu" class="w-6 h-6" />
    </button>

    {@render children()}
  </div>

  <div class="drawer-side md:hidden">
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <label for="my-drawer-toggle" class="drawer-overlay" onclick={() => closeMenu()}></label>
    <div class="menu p-4 w-80 min-h-full bg-white">
      {@render MenuBlock(true)}
    </div>
  </div>
</div>
