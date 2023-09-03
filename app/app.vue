<script lang="ts" setup>
useSeoMeta({
  titleTemplate: (title) => [title, 'Spotz Cleaning Solution'].filter(Boolean).join(' - '),
});
</script>

<template>
  <VitePwaManifest />
  <NuxtPage />
  <div class="fixed inset-0 pointer-events-none z-10 flex flex-col justify-center items-center text-center opacity-20">
    <span class="text-display-large font-black text-size-[min(8rem,16vw)] leading-none">
      Anhzf Labs
    </span>
    <NuxtLink to="https://labs.anhzf.dev/" external target="_blank" class="text-title-large">
      https://labs.anhzf.dev
    </NuxtLink>
  </div>
</template>
