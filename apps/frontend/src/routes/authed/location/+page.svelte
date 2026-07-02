<script lang="ts">
  import LocationDashboard from './LocationDashboard.svelte'

  let { data } = $props()
</script>

<LocationDashboard items={data.locationItems} recentItems={data.recentLocationItems} />
