<script lang="ts">
  interface Props {
    placeholder?: string
    value?: string
    onInput?: (value: string) => void
  }

  let { placeholder = 'Search...', value = $bindable(''), onInput }: Props = $props()

  const handleInput = (e: Event) => {
    const target = e.target as HTMLInputElement
    value = target.value
    onInput?.(value)
  }
</script>

<input
  type="text"
  {placeholder}
  {value}
  oninput={handleInput}
  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
/>
