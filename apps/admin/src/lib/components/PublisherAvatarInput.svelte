<script lang="ts">
  interface Props {
    value?: string
  }

  let { value = $bindable('') }: Props = $props()
</script>

<div>
  <label for="avatar-url" class="block text-sm text-gray-700 mb-2">Avatar URI</label>
  <label class="input validator mb-0 h-[50px] w-full">
    <input
      id="avatar-url"
      type="url"
      required
      placeholder="https://"
      bind:value
      pattern="^(https?://)?([a-zA-Z0-9]([a-zA-Z0-9\-].*[a-zA-Z0-9])?\.)+[a-zA-Z].*$"
      title="Must be valid URL"
      class="w-full px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-gray-900 transition-colors mb-0"
    />
  </label>
  <p class="validator-hint">Must be valid URL</p>
</div>
