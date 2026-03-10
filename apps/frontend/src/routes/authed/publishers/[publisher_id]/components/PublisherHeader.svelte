<script lang="ts">
  interface Props {
    publisher: any
  }

  let { publisher }: Props = $props()
</script>

<div class="breadcrumbs text-sm mb-6">
  <ul>
    <li><a href="/authed/publishers">Publishers</a></li>
    <li>{publisher.title}</li>
  </ul>
</div>

<h2 class="text-2xl font-semibold mb-4">Products</h2>
