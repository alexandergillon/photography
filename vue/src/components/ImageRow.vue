<!--
  ImageRow.vue

  Lays out a row of images. Widths are assigned to the images based on their aspect ratio - this makes them all the
  same height (one way of thinking about that is that each image is "1" tall and "width/height" wide, in some imaginary
  unit).
-->
<template>
  <div class="image-row">
    <GalleryImage v-for="image in images" :key="image.key" :image="image" />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { ImageRow } from "@/types/manifest";
import GalleryImage from "@/components/GalleryImage.vue";

const props = defineProps<{
  images: ImageRow;
}>();

const aspects = computed(() => props.images.map(image => image.width / image.height));
const gridTemplateColumns = computed(() => aspects.value.map(aspect => `${aspect}fr`).join(" "));
</script>

<style scoped>
.image-row:first-of-type {
  margin-top: 2rem;
}

.image-row {
  --gap: 0.5rem;
  display: grid;
  grid-template-columns: v-bind(gridTemplateColumns);
  column-gap: var(--gap);
  margin-bottom: var(--gap);
}
</style>
