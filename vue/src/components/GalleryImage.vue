<!--
  GalleryImage.vue

  Displays an image, with a placeholder while loading.

  For the image/placeholder, as we have assigned widths in the parent ImageRow, we only have to tell it to take up the
  full width and the renderer will figure the size out. For the placeholder, we give it the same aspect ratio as the
  actual image to make the same strategy work.
-->
<template>
  <div v-if="!loaded" class="gallery-image-placeholder" :class="{ singleton: singleton }" />
  <a
    class="gallery-image-anchor"
    :data-fancybox="seriesUuid"
    :data-src="imageUrl(image.thumbKey)"
    :data-width="image.width"
    :data-height="image.height"
  >
    <img
      v-show="loaded"
      class="gallery-image"
      :class="{ singleton: singleton }"
      :src="imageUrl(image.thumbKey)"
      @load="loaded = true"
    >
  </a>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { imageUrl } from "@/utils/r2";
import type { Image } from "@/types/manifest";

const props = defineProps<{
  seriesUuid: string; // UUID of the image series
  image: Image; // The image itself
  singleton: boolean; // Whether the image is a singleton (only image in its row) - needed for styling
}>();
const aspect = computed(() => props.image.width / props.image.height);
const loaded = ref(false);
</script>

<style scoped>
.gallery-image-placeholder {
  aspect-ratio: v-bind(aspect);
  background-color: var(--image-placeholder-color);
}

.gallery-image, .gallery-image-placeholder {
  display: block;
  width: 100%;
  cursor: zoom-in;
}

/* In the non-singleton case, these styles have no effect (both the anchor and the image take up all available width).
   In the singleton case, the image may or may not take up all the width. This ensures the anchor is the same size, and
   centers both the anchor and the image. */
.gallery-image-anchor {
  width: fit-content;
  margin: 0 auto;
}

.gallery-image.singleton, .gallery-image-placeholder.singleton {
  width: unset; /* overrides non-singleton case */
  height: var(--singleton-height); /* set in ImageRow.vue */
}
</style>
