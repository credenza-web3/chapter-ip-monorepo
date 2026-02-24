<script lang="ts">
  interface Props {
    value?: string
  }

  let { value = $bindable('') }: Props = $props()
</script>

<div>
  <label for="publisher-name" class="block text-sm text-gray-700 mb-2">Publisher Name</label>
  <input
    id="publisher-name"
    type="text"
    bind:value
    placeholder="Enter name"
    class="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 transition-colors"
    required
  />
</div>
