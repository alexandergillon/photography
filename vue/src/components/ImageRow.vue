<!--
  ImageRow.vue

  Lays out a row of images. Widths are assigned to the images based on their aspect ratio - this makes them all the
  same height (one way of thinking about that is that each image is "1" tall and "width/height" wide, in some imaginary
  unit).
-->
<template>
  <div class="image-row" :class="{ singleton: singleton }">
    <GalleryImage
      v-for="image in images"
      :key="image.key"
      :series-uuid="seriesUuid"
      :image="image"
      :singleton="singleton"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { ImageRow } from "@/types/manifest";
import GalleryImage from "@/components/GalleryImage.vue";

const props = defineProps<{
  seriesUuid: string;
  images: ImageRow;
}>();

const aspects = computed(() => props.images.map(image => image.width / image.height));
const gridTemplateColumns = computed(() => aspects.value.map(aspect => `${aspect}fr`).join(" "));
const singleton = computed(() => props.images.length == 1);
const singletonAspect = computed(() => aspects.value[0]);
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

.image-row.singleton {
  /* The calc is the height that the image would be if it took up the entire width of the image series.
     If that's less than 75vh, that's fine. Otherwise, we cap it to 75vh so the entire image fits on screen. */
  --singleton-height: min( 75vh, calc(var(--image-series-width) / v-bind(singletonAspect)) );
  height: var(--singleton-height);
}
</style>
