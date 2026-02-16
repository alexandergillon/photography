<!--
  GalleryImage.vue

  Displays an image, with a placeholder while loading.

  For the image/placeholder, as we have assigned widths in the parent ImageRow, we only have to tell it to take up the
  full width and the renderer will figure the size out. For the placeholder, we give it the same aspect ratio as the
  actual image to make the same strategy work.
-->
<template>
  <div ref="div" class="gallery-image-div" :class="{ singleton: singleton, mobile: isMobile }">
    <a
      class="gallery-image-anchor"
      :data-fancybox="`${seriesUuid}-images`"
      :data-src="imageUrl(image.thumbKey)"
      :data-width="image.width"
      :data-height="image.height"
    >
      <img
        v-show="loaded"
        class="gallery-image"
        :class="{ loaded: loaded, mobile: isMobile }"
        :src="imageUrl(image.thumbKey)"
        @load="loaded = true"
      >
    </a>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch, useTemplateRef } from "vue";
import { useWindowSize } from "@vueuse/core";
import { imageUrl } from "@/utils/r2";
import type { Image } from "@/types/manifest";
import { useIsMobile } from "@/composables/isMobile";
import { useSizeUnit } from "@/composables/sizeUnit";

const props = withDefaults(defineProps<{
  seriesUuid: string; // UUID of the image series
  image: Image; // The image itself
  singleton?: boolean; // Whether the image is a singleton (only image in its row) - needed for styling
}>(), {
  singleton: false,
});
const { width, height } = useWindowSize();
const isMobile = useIsMobile();
const { sizeUnitNarrow } = useSizeUnit();
const loaded = ref(false);

const div = useTemplateRef("div");
const divWidth = ref(0);
function updateDivWidth() {
  if (div.value) {
    divWidth.value = parseFloat(window.getComputedStyle(div.value).width);
  }
}
onMounted(updateDivWidth);
watch([div, width, height], updateDivWidth);

// Keep in sync with style.css
const mobileBorderWidth = computed(() => 3 * sizeUnitNarrow.value);
// Calculates the correct aspect ratio, taking into account the borders on mobile. This forces the div to have the
// same dimensions of the image, which displays a placeholder box while the image is loading.
const aspect = computed(() => {
  const imageAspect = props.image.width / props.image.height;
  if (!isMobile.value) return imageAspect;

  const imageWidth = divWidth.value - 2 * mobileBorderWidth.value;
  const imageHeight = imageWidth / imageAspect;
  return divWidth.value / (imageHeight + 2 * mobileBorderWidth.value);
});


</script>

<style scoped>
.gallery-image-div {
  width: 100%;
  background-color: var(--image-placeholder-color);
  aspect-ratio: v-bind(aspect);
}

.gallery-image-div.singleton:not(.mobile) {
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

.gallery-image.mobile {
  display: block;
  box-sizing: border-box;
  border: var(--border-mobile);
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
