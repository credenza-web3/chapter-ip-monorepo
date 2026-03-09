<script lang="ts">
  let { 
    href, 
    icon: IconComponent, 
    children,
    activeColor = '#6e4ff7',
    inactiveBg = '#e4e8eb',
    inactiveTextColor = '#202225',
    iconSize = '22px'
  } = $props<{
    href: string
    icon: any
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
  class="flex py-2 px-8 gap-3 font-semibold"
  style:background-color={isActive ? 'transparent' : inactiveBg}
  style:color={textColor}
>
  <IconComponent class="w-[{iconSize}]" color={iconColor} />
  {@render children()}
</a>
