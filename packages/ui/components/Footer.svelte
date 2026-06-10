<script lang="ts">
  import CredenzaLogo from '../assets/credenza-min.svg'
</script>

<footer
  class="mx-auto flex w-full max-w-360 flex-col items-center justify-between gap-4 px-6 py-6 text-xs font-semibold text-[#a5a1a8] sm:flex-row sm:items-center"
>
  <p class="flex flex-wrap gap-x-[3px] gap-y-1">
    <span>© 2026 Chapter IP</span>
    <a class="text-primary hover:underline" href="/privacy-terms?tab=terms" target="_blank" rel="noreferrer">
      Terms and Conditions
    </a>
    <span>and</span>
    <a class="text-primary hover:underline" href="/privacy-terms?tab=privacy" target="_blank" rel="noreferrer">
      Privacy.
    </a>
  </p>

  <div
    class="flex items-center gap-2 rounded border border-[#dedbe0] bg-white px-2 py-1.5 text-sm font-bold text-[#4f4b52]"
  >
    <img src={CredenzaLogo} alt="" class="size-6" aria-hidden="true" />
    <span>Powered by Credenza</span>
  </div>
</footer>
