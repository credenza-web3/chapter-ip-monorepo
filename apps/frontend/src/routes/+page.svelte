<script lang="ts">
  import { LandingHero } from '@repo/ui-components'
  import { authStore } from '$lib'
</script>

<LandingHero onSignIn={() => authStore.startLogin()} />
