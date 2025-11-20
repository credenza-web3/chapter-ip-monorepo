<script lang="ts">
  import { authStore } from "$lib";
  import { onMount } from "svelte";
  import { page } from "$app/state";

  onMount(async () => {
    const code = page.url.searchParams.get("code");
    const state = page.url.searchParams.get("state");

    if (code && state) {
      try {
        await authStore.exchangeCodeForTokens(code, state);
      } catch (error) {
        console.error("Auth callback error:", error);
      }
    }
  });
</script>

<div class="pt-4 text-center">Processing authentication...</div>
