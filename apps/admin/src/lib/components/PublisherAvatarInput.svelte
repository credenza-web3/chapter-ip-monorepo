<script lang="ts">
  interface Props {
    value?: string
  }

  let { value = $bindable('') }: Props = $props()
</script>

<div>
  <label class="input validator mb-0 p-0 pt-2 w-full">
    <input
      id="avatar-url"
      type="url"
      required
      placeholder="https://"
      bind:value
      pattern="^(https?://)?([a-zA-Z0-9]([a-zA-Z0-9\-].*[a-zA-Z0-9])?\.)+[a-zA-Z].*$"
      title="Must be valid URL"
      class="input w-full mb-3 focus:border-[#988cff] focus:outline-none focus:ring-0"
    />
  </label>
  <p class="validator-hint">Must be valid URL</p>
</div>
