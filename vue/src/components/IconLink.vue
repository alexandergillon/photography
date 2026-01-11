<!--

  IconLink.vue

  Displays an icon, which is also a link to a URL. The icon is monochrome black, and changes to color on hover.

  Props:
    iconSrc   (string): Icon URL (color version)
    href      (string): Link URL
    alt       (string): Alt text
    title     (string): Title
-->
<template>
  <a :href="props.href">
    <img :src="props.iconSrc" :alt="props.alt" :title="props.title">
  </a>
</template>

<script setup lang="ts">
const props = defineProps<{
  iconSrc: string;
  href: string;
  alt: string;
  title: string;
}>();
</script>

<style scoped>
a {
  display: inline-block;
  height: 2rem;
}

img {
  height: 100%;
  filter: brightness(0) saturate(100%); /* monochrome black */
  transition: var(--animation-transition);
}

img:hover {
  filter: none;
  transition: var(--animation-transition);
}
</style>
