<!--
  TextLink.vue

  Displays a textual link with an external link icon. The text and icon highlight on focus/hover.

  Props:
  - href: URL
  - text: Display text
-->
<template>
  <HoverFilter filter="link-color-filter-hover">
    <a :href="href">
      {{ text }} <ExternalLinkIcon />
    </a>
  </HoverFilter>
</template>

<script setup lang="ts">
import ExternalLinkIcon from "@/components/ExternalLinkIcon.vue";
import HoverFilter from "@/components/HoverFilter.vue";

defineProps<{
  href: string;
  text: string;
}>();
</script>

<style scoped>
a {
  text-decoration: none;
  color: black;
  filter: var(--link-color-filter);
  transition: var(--animation-transition);
}
</style>
