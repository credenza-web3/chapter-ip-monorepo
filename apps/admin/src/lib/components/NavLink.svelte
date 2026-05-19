<script lang="ts">
  let {
    href,
    icon: IconComponent,
    children,
    activeColor = '#6e4ff7',
    inactiveTextColor = '#767682',
    iconSize = '22px',
  } = $props<{
    href: string
    icon?: any
    children: any
    activeColor?: string
    inactiveBg?: string
    inactiveTextColor?: string
    iconSize?: string
  }>()

  import { page } from '$app/state'

  let isActive = $derived(page.url.pathname === href)
  let textColor = $derived(isActive ? activeColor : inactiveTextColor)
  let iconColor = $derived(isActive ? activeColor : inactiveTextColor)
</script>

<a
  {href}
  class="flex items-center py-2 md:px-8 px-2 gap-3 font-semibold rounded-[5px] text-xs md:text-sm text-[#353e47]"
  style:background-color={isActive ? 'transparent' : ''}
  style:color={textColor}
>
  <IconComponent class="w-[{iconSize}]" color={iconColor} />

  <span class="relative md:text-[15px] text-[12px]">
    {@render children()}
    {#if isActive}
      <div class="absolute -bottom-7.75 left-0 right-0 h-1 rounded-full" style:background-color={activeColor}></div>
    {/if}
  </span>
</a>
