<script lang="ts">
  interface Props {
    value?: string
  }

  let { value = $bindable('') }: Props = $props()
</script>

<div>
  <input
    id="publisher-name"
    type="text"
    bind:value
    placeholder="Enter name"
    class="input w-full mb-3 focus:border-[#988cff] focus:outline-none focus:ring-0"
    required
  />
</div>
