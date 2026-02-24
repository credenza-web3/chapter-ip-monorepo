<script lang="ts">
  interface Props {
    isOpen: boolean
    close: () => void
    children: import('svelte').Snippet
  }

  let { isOpen, close, children }: Props = $props()
</script>

{#if isOpen}
  <div role="dialog" class="fixed inset-0 flex items-center justify-center z-50">
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="fixed inset-0 bg-black opacity-50" onclick={close}></div>
    <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
      {@render children?.()}
    </div>
  </div>
{/if}
