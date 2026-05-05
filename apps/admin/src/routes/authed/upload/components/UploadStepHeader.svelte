<script lang="ts">
  let { currentStep = 1 } = $props<{ currentStep: number }>()

  const steps = [
    {
      id: 1,
      eyebrow: 'Step 1',
      title: 'Upload your likeness',
      description: 'Add the title, description, preview image, and source file.',
    },
    {
      id: 2,
      eyebrow: 'Step 2',
      title: 'Licensing',
      description: 'Configure how this likeness can be licensed on the platform.',
    },
  ]
</script>

<div class="mb-10">
  <div class="mb-6 flex flex-wrap items-center gap-3">
    {#each steps as step}
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-3 rounded-full border px-4 py-2" class:border-primary={currentStep === step.id}>
          <span
            class="flex size-7 items-center justify-center rounded-full text-xs font-semibold"
            class:bg-primary={currentStep >= step.id}
            class:text-white={currentStep >= step.id}
            class:bg-[#efebe7]={currentStep < step.id}
            class:text-[#8f8378]={currentStep < step.id}
          >
            {step.id}
          </span>
          <div class="leading-tight">
            <div class="text-[11px] uppercase tracking-[0.18em] text-[#8f8378]">{step.eyebrow}</div>
            <div class="font-heading text-sm text-dark">{step.title}</div>
          </div>
        </div>
        {#if step.id < steps.length}
          <div class="hidden h-px w-10 bg-[#ded6cf] md:block"></div>
        {/if}
      </div>
    {/each}
  </div>

  <div class="max-w-2xl">
    <h1 class="mb-2 text-3xl font-semibold text-dark">{steps[currentStep - 1].title}</h1>
    <p class="text-sm text-[#6f655d]">{steps[currentStep - 1].description}</p>
  </div>
</div>
