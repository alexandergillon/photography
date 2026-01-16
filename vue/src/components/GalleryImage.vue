<!--
  GalleryImage.vue

  Displays an image, with a placeholder while loading.

  For the image/placeholder, as we have assigned widths in the parent ImageRow, we only have to tell it to take up the
  full width and the renderer will figure the size out. For the placeholder, we give it the same aspect ratio as the
  actual image to make the same strategy work.
-->
<template>
  <div class="gallery-image-div" :class="{ singleton: singleton }">
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
        :class="{ loaded: loaded }"
        :src="imageUrl(image.thumbKey)"
        @load="loaded = true"
      >
    </a>
  </div>
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
.gallery-image-div {
  width: 100%;
  aspect-ratio: v-bind(aspect);
  background-color: var(--image-placeholder-color);
}

.gallery-image-div.singleton {
  width: unset;
  height: var(--singleton-height);
  margin: 0 auto;
}

.gallery-image-anchor {
  display: block;
  width: 100%;
  height: 100%;
}

.gallery-image {
  width: 100%;
  cursor: zoom-in;
}

@keyframes imageFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.gallery-image.loaded {
  animation: imageFadeIn 0.5s ease-in;
}
</style>
