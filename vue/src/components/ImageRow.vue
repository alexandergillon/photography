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
import { useWindowSize } from "@vueuse/core";
import constants from "@/utils/constants";
import type { ImageRow } from "@/types/manifest";
import GalleryImage from "@/components/GalleryImage.vue";

/** Base props, etc. */

const props = defineProps<{
  seriesUuid: string;
  images: ImageRow;
}>();
const { width, height } = useWindowSize();
const aspects = computed(() => props.images.map(image => image.width / image.height));
const gridTemplateColumns = computed(() => aspects.value.map(aspect => `${aspect}fr`).join(" "));

/** Styling for singletons, which are rows with only one image. */

const singleton = computed(() => props.images.length == 1);
const singletonAspect = computed(() => aspects.value[0]);
/**
 * This is the core calculation of the height of a singleton row.
 *
 * The idea is that if the image can take up the full width while not taking up too much height, it does.
 *
 * If not, it takes up 75% of the viewport height, but only if that leaves a sufficient "gap" on either
 * side of the image. If not, it's clamped to 80% of the width of an image series.
 *
 * The "gap" part avoids having certain widths look a little awkward, where a singleton is slightly smaller
 * than the width of an image series. If that were to happen, we make it a bit smaller, to make the gaps
 * look deliberate.
 */
const singletonHeight = computed(() => {
  if (!singleton.value) return "unset"; // Vue computed caching, so that only singletons recalculate on window resize

  const vw = width.value / 100;
  const vh = height.value / 100;

  // Height of the image, if it takes up the full width of the image series
  const fullWidthHeight = constants.IMAGE_SERIES_WIDTH_VW * vw / singletonAspect.value;
  // Width of the image, if it takes up 75% of the viewport height
  const _75HeightWidth = 75 * vh * singletonAspect.value;
  // 80% of the width of the image series
  const _80SeriesWidth = 0.8 * constants.IMAGE_SERIES_WIDTH_VW * vw;

  // If the full-width image takes up less than 75% of the viewport height, use that
  if (fullWidthHeight < 75 * vh) {
    return `${fullWidthHeight}px`;
  }
  // Else, if clamping it to 75% of the viewport height leaves a sufficient gap, then use that
  else if (_75HeightWidth < _80SeriesWidth) {
    return "75vh";
  }
  // Else make it small enough so that there is at least a sufficient gap on each side
  else {
    const _80WidthHeight = _80SeriesWidth / singletonAspect.value;
    return `${_80WidthHeight}px`;
  }
});
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
  --singleton-height: v-bind(singletonHeight);
  height: var(--singleton-height);
}
</style>
