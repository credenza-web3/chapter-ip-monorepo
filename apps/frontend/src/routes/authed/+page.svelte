<script lang="ts">
  import CatalogDashboard from './CatalogDashboard.svelte'

  let { data } = $props()
</script>

<CatalogDashboard likenessItems={data.likenessItems} locationItems={data.locationItems} />
