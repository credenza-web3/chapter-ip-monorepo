<script lang="ts">
  import Checkmark from '$lib/assets/Checkmark.svelte'
  import Cross from '$lib/assets/Cross.svelte'
  import { likenessStore } from '../stores/likeness-store'

  console.log($likenessStore)
</script>

<div class="space-y-12 mt-7.25 text-dark">
  <div class="pb-6">
    <h2 class="mb-2 text-[28px] font-medium text-left text-dark">Confirm your Likeness</h2>
    <p class="mt-3 text-basetext-left text-[#72717b]">
      Vestibulum mollis lacinia ligula in pellentesque. Sed eu justo ligula. Donec vel nisl sit amet orci condimentum
      egestas nec euismod diam. Interdum et malesuada fames ac ante ipsum primis in faucibus.
    </p>
  </div>

  <div
    class="flex flex-col gap-20 mt-19 border border-dashed border-[#1a1a2e33] bg-cream rounded-lg py-6 px-19 justify-center"
  >
    <div class="">
      <!-- Edit button -->
      <div class="flex justify-end mb-6">
        <button
          class="bg-primary text-white rounded-sm px-5 py-2.5 text-sm font-medium hover:bg-[#5a4bd1] transition-colors"
        >
          Edit details
        </button>
      </div>

      <!-- Avatar + name -->
      <div class="flex flex-col items-center mb-8">
        <div class="flex items-center w-111 justify-center mb-3">
          <div class="flex-1 h-px bg-[#c8c4bc]"></div>
          <div class="w-24 h-24 rounded-full overflow-hidden mx-4 shrink-0">
            <img src={'avala.jpg'} alt="" class="w-full h-full object-cover" />
          </div>
          <div class="flex-1 h-px bg-[#c8c4bc]"></div>
        </div>
        <h1 class="text-[28px] font-semibold text-dark tracking-tight mt-1">{$likenessStore.profile.stageName}</h1>
      </div>

      <!-- Main content -->
      <div class="flex gap-6 mx-auto flex-wrap">
        <!-- Left: photo + thumbnails -->
        <div class="flex-1 max-w-100">
          <div class="rounded-xl overflow-hidden mb-2.5">
            <img src="main-photo.jpg" alt="Chad Bowser" class="w-full object-cover" style="height: 340px;" />
          </div>
          <div class="grid grid-cols-4 gap-1.5">
            <div class="rounded-lg overflow-hidden aspect-square">
              <img src="thumb1.jpg" alt="" class="w-full h-full object-cover" />
            </div>
            <div class="rounded-lg overflow-hidden aspect-square">
              <img src="thumb2.jpg" alt="" class="w-full h-full object-cover" />
            </div>
            <div class="rounded-lg overflow-hidden aspect-square">
              <img src="thumb3.jpg" alt="" class="w-full h-full object-cover" />
            </div>
            <div class="rounded-lg overflow-hidden aspect-square relative bg-[#c4beb6]">
              <img src="thumb4.jpg" alt="" class="w-full h-full object-cover opacity-60" />
              <span class="absolute inset-0 flex items-center justify-center text-[#1a1a1a] font-bold text-sm">+16</span
              >
            </div>
          </div>
        </div>

        <!-- Right: info -->
        <div class="flex-[1.1] min-w-64 flex flex-col gap-6">
          <!-- Bio -->
          <div>
            <h2 class="text-base font-semibold text-[#202225] mb-1.5">Bio</h2>
            <p class="text-base text-[#72717b] leading-relaxed">
              {$likenessStore.profile.bio}
            </p>
          </div>

          <!-- Physical attributes -->
          <div>
            <h2 class="text-base font-semibold text-[#202225] mb-2">Physical attributes</h2>
            <table class="w-full text-base text-[#72717b]">
              <tbody>
                <tr>
                  <td class="py-1 font-semibold w-1/5">Ethnicity:</td>
                  <td class="py-1">{$likenessStore.profile.attributes.ethnicity}</td>
                </tr>
                <tr>
                  <td class="py-1 font-semibold">Height:</td>
                  <td class="py-1"
                    >{$likenessStore.profile.attributes.heightFt}' {$likenessStore.profile.attributes.heightIn}"</td
                  >
                </tr>
                <tr>
                  <td class="py-1 font-semibold">Weight:</td>
                  <td class="py-1">{$likenessStore.profile.attributes.weight} lbs</td>
                </tr>
                <tr>
                  <td class="py-1 font-semibold">Eye color:</td>
                  <td class="py-1">{$likenessStore.profile.attributes.eyeColor}</td>
                </tr>
                <tr>
                  <td class="py-1 font-semibold">Hair color:</td>
                  <td class="py-1">{$likenessStore.profile.attributes.hairColor}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Union affiliations -->
          <div>
            <h2 class="text-base font-semibold text-[#202225] mb-2">Union affiliations</h2>
            <table class="w-full text-base text-[#72717b]">
              <tbody>
                {#each $likenessStore.profile.affiliations as aff (aff.memberId)}
                  <tr>
                    <td class="py-1 font-semibold w-1/5">{aff.union}</td>
                    <td class="py-1">{aff.memberId}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <div class="">
      <!-- Edit button -->
      <div class="flex justify-end mb-8">
        <button
          class="bg-primary text-white rounded-sm px-5 py-2.5 text-sm font-medium hover:bg-[#5a4bd1] transition-colors"
        >
          Edit licensing
        </button>
      </div>

      <!-- Sections -->
      <div class="flex flex-col gap-8 text-base">
        <!-- Licensing types -->
        <div>
          <h2 class="text-[18px] font-semibold text-dark mb-3">Licensing types</h2>
          <div class="flex flex-col gap-4">
            {#if $likenessStore.licensing.licenseTypes['single-use']}
              <div class="flex justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1.5">
                    <Checkmark />
                    <span class="font-semibold text-dark">Single-use campaign</span>
                  </div>
                  <p class="text-[#747474] leading-relaxed pl-6">
                    Morbi in tempor magna, eu semper urna. Nam vel ex non ex accumsan viverra. Vivamus hendrerit, neque
                    et feugiat tempus, tortor libero congue ipsum.
                  </p>
                </div>
                <div class="shrink-0 text-right">
                  <span class="text-sm font-semibold text-dark"
                    >$ {$likenessStore.licensing.licensePrices['single-use']}</span
                  >
                  <span class="text-[10px] text-[#7a7a8a] ml-1">USD</span>
                </div>
              </div>
            {/if}

            {#if $likenessStore.licensing.licenseTypes['perpetual']}
              <div class="flex">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1.5">
                    <Checkmark />
                    <span class="font-semibold text-dark">Perpetual campaign</span>
                  </div>
                  <p class="text-[#747474] leading-relaxed pl-6">
                    Morbi in tempor magna, eu semper urna. Nam vel ex non ex accumsan viverra. Vivamus hendrerit, neque
                    et feugiat tempus, tortor libero congue ipsum.
                  </p>
                </div>
                <div class="shrink-0 text-right">
                  <span class="text-sm font-semibold text-dark"
                    >$ {$likenessStore.licensing.licensePrices['perpetual']}</span
                  >
                  <span class="text-[10px] text-[#7a7a8a] ml-1">USD</span>
                </div>
              </div>
            {/if}
          </div>
        </div>

        <!-- Permitted uses -->
        <div>
          <h2 class="text-[18px] font-semibold text-dark mb-3">Permitted uses</h2>

          {#each Object.keys($likenessStore.licensing.permittedUses) as j (j)}
            <div class="flex items-center gap-2 mb-1.5">
              <Checkmark />
              <span class="font-semibold text-dark">{j}</span>
            </div>
            <p class=" text-[#747474] leading-relaxed pl-6">
              Nunc erat elit, pulvinar ut accumsan id, pretium vel lectus. Etiam Leo ipsum, fermentum.
            </p>
          {/each}
        </div>

        <!-- Allow minor retouching -->
        <div>
          <h2 class="text-[18px] font-semibold text-dark mb-3">Allow minor retouching?</h2>

          <div class="flex items-center gap-2">
            {#if $likenessStore.licensing.allowRetouching === 'yes'}
              <Checkmark />
              <span class="font-semibold text-dark">Yes</span>
            {:else}
              <Cross />
              <span class="font-semibold text-dark">No</span>
            {/if}
          </div>
        </div>

        <!-- Approve final use -->
        <div>
          <h2 class="text-[18px] font-semibold text-dark mb-3">Approve final use?</h2>
          <div class="flex items-center gap-2">
            {#if $likenessStore.licensing.approveFinalUse === 'yes'}
              <Checkmark />
              <span class="font-semibold text-dark">Yes</span>
            {:else}
              <Cross />
              <span class="font-semibold text-dark">No</span>
            {/if}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<div class="flex justify-end gap-1.5 mt-12.5">
  <button
    class="text-sm font-medium rounded-sm h-9.5 px-7.5 bg-primary disabled:bg-[#e1dddb] text-cream"
    disabled={$likenessStore.ui.loading}
  >
    Save and Publish
  </button>
</div>
