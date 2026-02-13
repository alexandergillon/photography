<!--
  DropdownIcon.vue

  Displays a dropdown icon, that animates open/closed.
-->
<template>
  <img
    :class="{ mobile: isMobile }"
    src="/images/dropdown.svg"
    alt="dropdown icon"
    :data-open="open ? 'true' : undefined"
  >
</template>

<script setup lang="ts">
import { useIsMobile } from "@/composables/isMobile";

defineProps<{
  open: boolean;
}>();
const isMobile = useIsMobile();
</script>

<style scoped>
img {
  height: var(--size-unit);
  filter: none;
  transform: scaleY(1);
  transition: var(--animation-transition) ease-in-out;
}

img.mobile {
  height: calc(2 * var(--size-unit));
}

img[data-open] {
  transform: scaleY(-1);
  transition: var(--animation-transition) ease-in-out;
}
</style>
