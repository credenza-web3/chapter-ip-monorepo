<script>
  import WrittenWorksIcon from '$lib/assets/book-icon.svg'
  import LocationIcon from '$lib/assets/location-icon.svg'
  import LikenessIcon from '$lib/assets/account-icon.svg'
  import { goto } from '$app/navigation'

  const categories = [
    {
      id: 'written-works',
      title: 'Written Works',
      description: 'Scripts, articles and written works.',
      icon: WrittenWorksIcon,
      path: '/authed/upload',
    },
    {
      id: 'location',
      title: 'Location',
      description: '3D scans of real-world locations for virtual production.',
      icon: LocationIcon,
      path: '/authed/upload',
    },
    {
      id: 'likeness',
      title: 'Likeness',
      description: 'Image, voice and identity licensing.',
      icon: LikenessIcon,
      path: '/authed/likeness',
    },
  ]
</script>

<div class="min-h-xl p-8 border border-[#eef2f6] rounded-3xl bg-[#f8f5f1] flex justify-center">
  <div class="w-full max-w-5xl">
    <!-- Header -->
    <div class="mb-6.25">
      <h1 class="text-lg font-semibold text-left text-dark">Getting started with ChapterIP</h1>
      <p class=" text-sm font-medium text-left text-[#767682]">What do you want to license today?</p>
    </div>

    <!-- Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.25 w-full">
      {#each categories as category (category.id)}
        <div
          class="
           rounded-lg w-full mx-auto
           max-w-87.5
           aspect-square
            border-2 border-dashed border-[#c8c4bc]
            flex flex-col items-center justify-center
            gap-8.5
            transition-all duration-300 group
            bg-cream pt-5 pb-7.5 px-5
          "
        >
          <!-- Icon -->
          <div class="flex flex-col items-center justify-center">
            <div class="text-dark opacity-80 group-hover:opacity-100 transition-opacity">
              <img src={category.icon} alt={category.title} class="w-auto h-8 mb-2.5" />
            </div>

            <!-- Text -->
            <div class="text-center">
              <h2 class="text-lg font-semibold text-dark">
                {category.title}
              </h2>
              <p class="text-sm leading-[12.5px] text-[#747474]">
                {category.description}
              </p>
            </div>
          </div>

          <!-- Button -->
          <button
            onclick={() => goto(category.path)}
            class="
              rounded-sm bg-primary
              hover:-translate-y-0.5
              text-sm font-medium text-center text-cream px-7.5 py-2.5"
          >
            Get Started
          </button>
        </div>
      {/each}
    </div>
  </div>
</div>
