<script lang="ts">
  type Props = {
    value: string
    multiline?: boolean
    displayClass?: string
    placeholder?: string
    onSave: (value: string) => Promise<void>
  }

  let {
    value = $bindable(),
    multiline = false,
    displayClass = '',
    placeholder = 'Click to edit',
    onSave,
  }: Props = $props()
  let isEditing = $state(false)
  let isSaving = $state(false)
  let editValue = $state('')

  const startEdit = () => {
    editValue = value
    isEditing = true
  }

  const handleSave = async () => {
    if (!editValue.trim()) return
    isSaving = true
    try {
      await onSave(editValue)
      value = editValue
      isEditing = false
    } finally {
      isSaving = false
    }
  }

  const handleCancel = () => {
    editValue = value
    isEditing = false
  }
</script>

<div class="relative">
  <button
    type="button"
    class="{displayClass} cursor-pointer hover:text-primary transition-colors {isEditing ? 'invisible' : ''} {!value
      ? 'text-gray-400'
      : ''} bg-transparent border-none p-0 text-left"
    title="Click to edit"
    onclick={startEdit}
  >
    {value || placeholder}
  </button>

  {#if isEditing}
    <div
      class="absolute top-0 left-0 min-w-87.5 w-max z-10 bg-white rounded-lg shadow-lg border border-primary p-2 flex {multiline
        ? 'flex-col'
        : 'items-center'} gap-2"
    >
      {#if multiline}
        <textarea
          class="textarea textarea-bordered text-sm text-gray-600 w-full resize-none"
          rows="3"
          bind:value={editValue}
        ></textarea>
      {:else}
        <input type="text" class="input input-bordered input-sm w-full" bind:value={editValue} />
      {/if}
      <div class="flex gap-2">
        <button class="btn btn-sm bg-primary border-none text-white w-13" onclick={handleSave} disabled={isSaving}>
          {#if isSaving}
            <span class="loading loading-spinner loading-xs"></span>
          {:else}
            Save
          {/if}
        </button>
        <button class="btn btn-sm btn-ghost text-gray-500" onclick={handleCancel} disabled={isSaving}> Cancel </button>
      </div>
    </div>
  {/if}
</div>
