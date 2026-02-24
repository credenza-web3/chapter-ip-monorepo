<script lang="ts">
  import { Modals } from 'svelte-modals'
  let { children } = $props()
</script>

{@render children?.()}

<Modals>
  <!-- shown when any modal is opened -->
  {#snippet backdrop({ close })}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- svelte-ignore element_invalid_self_closing_tag -->
    <div class="backdrop" onclick={() => close()} />
  {/snippet}
</Modals>

<style>
  .backdrop {
    position: fixed;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    background: rgba(0, 0, 0, 0.5);
  }
</style>
