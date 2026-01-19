<!--
  DropdownIcon.vue

  Displays a dropdown icon, that animates open/closed.
-->
<template>
  <img src="/images/dropdown.svg" alt="dropdown icon" :data-open="open ? 'true' : undefined">
</template>

<script setup lang="ts">
defineProps<{
  open: boolean;
}>();
</script>

<style scoped>
img {
  height: 1rem;
  filter: none;
  transform: scaleY(1);
  transition: var(--animation-transition) ease-in-out;
}

img[data-open] {
  transform: scaleY(-1);
  transition: var(--animation-transition) ease-in-out;
}
</style>
