<script lang="ts">
  import { uploadStore } from '../stores/upload-store'
  import LicenseForm from './LicenseForm.svelte'

  const formatPrice = (value: number) => (value > 0 ? `$${value}` : 'Not set')
</script>

<div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
  <div class="space-y-6">
    <section class="rounded-[28px] border border-[#e6dfd8] bg-white p-6 shadow-sm">
      <div class="mb-6">
        <h2 class="mb-2 text-lg font-semibold text-dark">Licensing setup</h2>
        <p class="text-sm text-[#6f655d]">
          Choose which license types should be available for this likeness and define their pricing.
        </p>
      </div>

      <LicenseForm />
    </section>

    <section class="rounded-[28px] border border-[#e6dfd8] bg-[#f8f4ef] p-6 shadow-sm">
      <div class="mb-4">
        <div class="mb-2 text-[11px] uppercase tracking-[0.18em] text-[#8f8378]">Before publishing</div>
        <h2 class="text-lg font-semibold text-dark">Review the asset</h2>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <div class="rounded-2xl bg-white p-4">
          <div class="mb-1 text-xs uppercase tracking-[0.12em] text-[#8f8378]">Title</div>
          <div class="font-medium text-dark">{$uploadStore.title || 'Untitled likeness'}</div>
        </div>

        <div class="rounded-2xl bg-white p-4">
          <div class="mb-1 text-xs uppercase tracking-[0.12em] text-[#8f8378]">Uploaded file</div>
          <div class="font-medium text-dark">{$uploadStore.uploaded?.name || 'No file selected yet'}</div>
        </div>
      </div>
    </section>
  </div>

  <aside class="rounded-[28px] border border-[#e6dfd8] bg-dark p-6 text-white shadow-sm">
    <div class="mb-6">
      <div class="mb-2 text-[11px] uppercase tracking-[0.18em] text-white/60">License summary</div>
      <h2 class="text-lg font-semibold">Pricing overview</h2>
    </div>

    <div class="space-y-4">
      <div class="rounded-2xl bg-white/8 p-4">
        <div class="mb-1 text-xs uppercase tracking-[0.12em] text-white/50">Lifetime</div>
        <div class="text-base font-medium">
          {$uploadStore.isLifetimeLicense ? formatPrice($uploadStore.lifetimePrice) : 'Disabled'}
        </div>
      </div>

      <div class="rounded-2xl bg-white/8 p-4">
        <div class="mb-1 text-xs uppercase tracking-[0.12em] text-white/50">One-time</div>
        <div class="text-base font-medium">
          {$uploadStore.isOneTimeLicense ? formatPrice($uploadStore.oneTimePrice) : 'Disabled'}
        </div>
      </div>
    </div>
  </aside>
</div>
