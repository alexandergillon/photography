<!--
  TextLink.vue
  
  Displays a textual link with an external link icon. The text and icon highlight on focus/hover.

  Props:
  - href: URL
  - text: Display text
-->
<template>
  <a :href="href">
    {{ text }} <ExternalLinkIcon />
  </a>
</template>

<script setup lang="ts">
import ExternalLinkIcon from './ExternalLinkIcon.vue';

defineProps<{
  href: string;
  text: string;
}>();
</script>

<style scoped>
a, a:deep(img) {
  text-decoration: none;
  color: black;
  filter: var(--link-color-filter);
  transition: var(--animation-transition);
}

a:hover, a:focus, a:hover:deep(img), a:focus:deep(img) {
  filter: var(--link-color-filter-hover);
  transition: var(--animation-transition);
}
</style>
