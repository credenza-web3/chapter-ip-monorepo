<script>
  let { checked = $bindable() } = $props()

  function handleClick() {
    checked = !checked
  }
</script>

<button
  role="switch"
  aria-checked={checked}
  onclick={handleClick}
  class="relative inline-flex items-center w-12 h-5 rounded-full transition-colors duration-300 ease-in-out focus:outline-none {checked
    ? 'bg-[#6e4ff7]'
    : 'bg-gray-200'}"
  title="Toggle license type"
>
  <span
    class="inline-block w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300 ease-in-out {checked
      ? 'translate-x-7'
      : 'translate-x-1'}"
  ></span>
</button>
