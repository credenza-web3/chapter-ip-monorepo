<script lang="ts">
  import Base from './Base.svelte'

  let {
    title,
    description,
    onClose,
    submitText,
    onSubmit,
  }: {
    title: string
    submitText?: string
    description?: string
    onClose: () => void
    onSubmit: () => void
  } = $props()
</script>

<Base {onClose} isBack={true}>
  <div class="flex flex-col gap-3 items-start">
    <h3 class="text-[22px] font-semibold">{title}</h3>
    {#if description}
      <p class="text-base font-normal text-[#747474]">{description}</p>
    {/if}

    <div class="flex space-x-4 mt-8 w-full justify-center">
      <button class="btn bg-[#6734ff] text-white px-12 py-6 rounded-md text-base w-[350px]" onclick={onSubmit}
        >{submitText}</button
      >
    </div>
  </div>
</Base>
