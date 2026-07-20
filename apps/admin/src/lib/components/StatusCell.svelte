<script lang="ts">
  import Edit from '$lib/assets/edit.svg'
  import { getTrpcClient } from '$lib/stores/trpc-client'
  import { notify, ToastType } from '@repo/ui-components'
  import { STATUS, type StatusValue } from '../../routes/authed/likeness/constants/constants'

  const STATUS_MAP = {
    DRAFT: { label: 'Draft', classes: 'border-[#D58B00]/20 bg-[#f2e3c8] text-[#d58b00]', img: Edit },
    ACTIVE: { label: '✓ Active', classes: 'border-[#93C4A1]/25 bg-[#f1fbf5] text-[#499b60]', img: undefined },
    SALE_DISABLED: { label: '✗ Disabled', classes: 'border-[#DE8C8C]/25 bg-[#fccaca] text-[#d14e4e]', img: undefined },
  }

  const STATUS_OPTIONS_BY_STATUS: Record<StatusValue, readonly StatusValue[]> = {
    DRAFT: [],
    ACTIVE: [STATUS.SALE_DISABLED],
    SALE_DISABLED: [STATUS.ACTIVE],
  }

  let { status = $bindable(STATUS.ACTIVE), contentId }: { contentId: string; status: StatusValue } = $props()

  let open = $state(false)
  let top = $state(0)
  let left = $state(0)
  let trigger: HTMLElement | null = null
  let updating = $state(false)

  const trpcClient = getTrpcClient()

  let currentStatus = $state(status)
  const cfg = $derived(STATUS_MAP[currentStatus])
  const statusOptions = $derived(STATUS_OPTIONS_BY_STATUS[currentStatus])

  function toggle(event: MouseEvent) {
    if (status === STATUS.DRAFT) return
    trigger = event.currentTarget as HTMLElement | null
    if (!trigger) return
    if (open) {
      open = false
      return
    }
    const rect = trigger.getBoundingClientRect()
    left = Math.max(12, Math.min(rect.right - 150, window.innerWidth - 150 - 12))
    top = rect.bottom + 4
    open = true
  }

  function closeMenu() {
    open = false
  }

  async function handleSelect(newStatus: StatusValue) {
    if (newStatus === status) {
      closeMenu()
      return
    }
    updating = true
    closeMenu()
    try {
      await trpcClient.contents.updateContentMetadata.mutate({ contentId, status: newStatus })
      currentStatus = newStatus
      status = newStatus
      notify('Status updated', ToastType.SUCCESS)
    } catch {
      notify('Failed to update status', ToastType.FAIL)
    } finally {
      updating = false
    }
  }
</script>

<svelte:window onscroll={closeMenu} onresize={closeMenu} />

<button
  type="button"
  aria-haspopup="menu"
  aria-expanded={open}
  aria-label="Change status"
  onclick={toggle}
  disabled={updating}
  class="inline-flex items-center gap-1 px-2.5 py-1.25 rounded-sm text-sm {cfg.classes} whitespace-nowrap cursor-pointer border-0 {updating
    ? 'opacity-50'
    : ''}"
>
  {#if cfg.img}
    <img src={cfg.img} alt="" class="size-2.5" />
  {/if}
  {cfg.label}
</button>

{#if open}
  <button
    type="button"
    aria-label="Close menu"
    class="fixed inset-0 z-40 cursor-default bg-transparent"
    onclick={closeMenu}
  ></button>

  <ul
    class="menu fixed z-50 w-38 rounded-md border border-[#1A1A2E]/10 bg-cream p-2 text-left text-sm font-medium text-[#1A1A2E99] shadow-[3px_6px_8px_0_rgba(21,34,50,0.08)]"
    style="top: {top}px; left: {left}px;"
  >
    {#each statusOptions as option (option)}
      {@const opt = STATUS_MAP[option]}
      <li>
        <button
          type="button"
          class="w-full text-left px-2 py-1.5 rounded-sm flex items-center gap-2 {option === status
            ? 'bg-[#ece7df]'
            : 'hover:bg-[#f5f2ec]'}"
          onclick={() => handleSelect(option)}
        >
          {#if opt.img}
            <img src={opt.img} alt="" class="size-2.5 shrink-0" />
          {/if}
          {opt.label}
        </button>
      </li>
    {/each}
  </ul>
{/if}
