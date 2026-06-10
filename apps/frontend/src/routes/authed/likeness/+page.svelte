<script lang="ts">
  import LikenessDashboard from './LikenessDashboard.svelte'

  let { data } = $props()
</script>

<LikenessDashboard items={data.likenessItems} />
