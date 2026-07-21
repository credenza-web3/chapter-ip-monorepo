<script lang="ts">
  import chapterLogo from '../assets/chapter-new-logo.png'
  import landing1 from '../assets/landing-1.png'
  import landing2 from '../assets/landing-2.png'
  import landing3 from '../assets/landing-3.png'
  import landing4 from '../assets/landing-4.png'
  import landing5 from '../assets/landing-5.png'

  let { onSignIn, learnMoreHref = 'https://chapterip.com' } = $props<{
    onSignIn: () => void
    learnMoreHref?: string
  }>()

  const description =
    'The platform that gives creators and rights holders true ownership of their intellectual property in the age of AI.'

  const buttonClass =
    'inline-flex h-[38px] w-[144px] shrink-0 items-center justify-center rounded bg-primary text-[16px] font-medium leading-none text-[#FEF9EF] transition-opacity hover:opacity-90'
</script>

<section
  class="relative flex min-h-[calc(100vh-260px)] items-center justify-center overflow-hidden bg-cream px-4 py-12 sm:px-6"
  aria-label="ChapterIP landing"
>
  <div
    class="hero-fade-in relative mx-auto flex w-full max-w-[1800px] flex-col items-center justify-center lg:aspect-[1800/680]"
  >
    <!-- Decorative images (percentage positioning from Zeplin 1800×680) -->
    <div class="pointer-events-none absolute inset-0 hidden lg:block" aria-hidden="true">
      <img
        src={landing2}
        alt=""
        class="hero-float-slow absolute object-contain"
        style="left: 14.39%; top: 33.82%; width: 10.33%; height: 31.91%;"
      />
      <img
        src={landing3}
        alt=""
        class="absolute object-contain"
        style="left: 21.89%; top: 26.76%; width: 8.89%; height: 29.26%;"
      />
      <img
        src={landing5}
        alt=""
        class="hero-float-delayed absolute object-contain"
        style="left: 17.94%; top: 60%; width: 10.17%; height: 31.76%;"
      />
      <img
        src={landing4}
        alt=""
        class="hero-drift absolute object-contain"
        style="left: 66.72%; top: 29.71%; width: 16.78%; height: 26.47%;"
      />
      <img
        src={landing1}
        alt=""
        class="hero-float-slow absolute object-contain"
        style="left: 73.83%; top: 52.35%; width: 16.39%; height: 24.41%;"
      />
    </div>

    <!-- Logo → description → CTAs (lg: width capped to clear channel between image clusters) -->
    <div class="relative z-10 flex w-full max-w-xl flex-col items-center lg:max-w-[35%]">
      <img src={chapterLogo} alt="ChapterIP" class="mb-8 w-full max-w-[317px] object-contain" />

      <p
        class="mb-10 w-full pl-4 text-center text-[clamp(16px,1.1vw+14px,18px)] font-medium leading-[1.44] text-[#34302B] sm:pl-6"
      >
        {description}
      </p>

      <div class="flex flex-col items-center gap-3 sm:flex-row sm:gap-1.5">
        <a href={learnMoreHref} target="_blank" rel="noopener noreferrer" class={buttonClass}> Learn more </a>
        <button type="button" onclick={onSignIn} class={buttonClass}> Sign in </button>
      </div>
    </div>
  </div>
</section>
