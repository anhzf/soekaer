<script lang="ts" setup>
useSeoMeta({
  titleTemplate: (title) => [title, 'Soekaer'].filter(Boolean).join(' - '),
});
</script>

<template>
  <NuxtPage />
</template>
