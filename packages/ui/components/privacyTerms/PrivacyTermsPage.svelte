<script lang="ts">
  import { privacyTerms, termsText } from './termsData'
  import TermsPrivacyText from './TermsPrivacyText.svelte'

  let tab: 'privacy' | 'terms' = 'privacy'
</script>

<div class="min-h-screen py-16 px-4">
  <div class="max-w-5xl mx-auto">
    <div class="bg-base-100 shadow-xl rounded-2xl p-8 md:p-12">
      <!-- Header -->
      <div class="text-center mb-10">
        <h1 class="text-4xl font-bold mb-3">Privacy & Terms</h1>
        <p class="text-base-content/70">Please review our policies carefully before using the Platform</p>
      </div>

      <div role="tablist" class="tabs tabs-lift">
        <button role="tab" class="tab {tab === 'privacy' ? 'tab-active' : ''}" on:click={() => (tab = 'privacy')}>
          Privacy Policy
        </button>
        <button role="tab" class="tab {tab === 'terms' ? 'tab-active' : ''}" on:click={() => (tab = 'terms')}>
          Terms & Conditions
        </button>
      </div>
      <!-- Content -->
      <div class="mt-8 rounded-xl">
        <div class="space-y-4">
          {#if tab === 'privacy'}
            <TermsPrivacyText title="Privacy Policy" sections={privacyTerms} />
          {/if}

          {#if tab === 'terms'}
            <TermsPrivacyText title="Terms & Conditions" sections={termsText} />
          {/if}
        </div>
      </div>
    </div>
  </div>
</div>
