<script lang="ts">
  import { PrivacyTerms } from '@repo/ui-components'
  import { page } from '$app/stores'

  type Tab = 'terms' | 'privacy'

  let activeTab: Tab
  $: activeTab = $page.url.searchParams.get('tab') === 'privacy' ? 'privacy' : 'terms'
</script>

<PrivacyTerms {activeTab} />
