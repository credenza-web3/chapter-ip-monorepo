<script lang="ts">
  let { currentStep = 1 } = $props<{ currentStep: number }>()

  const steps = [1, 2, 3]
</script>

<div class="mt-12.5">
  <div class="flex items-center gap-1 mb-2">
    {#each steps as step (step)}
      <div
        class="h-2.5 w-12.5 rounded-full transition-colors"
        class:bg-primary={step <= currentStep}
        class:bg-[#e1dddb]={step > currentStep}
      ></div>
    {/each}
  </div>

  <div class="text-xs font-medium text-[#72717b]">
    Step {currentStep} of {steps.length}
  </div>
</div>
