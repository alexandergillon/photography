<!--
  GalleryImage.vue

  Displays an image, with a placeholder while loading.

  For the image/placeholder, as we have assigned widths in the parent ImageRow, we only have to tell it to take up the
  full width and the renderer will figure the size out. For the placeholder, we give it the same aspect ratio as the
  actual image to make the same strategy work.
-->
<template>
  <div v-if="!loaded" class="gallery-image-placeholder" />
  <img
    v-show="loaded"
    class="gallery-image"
    :src="imageUrl(image.thumbKey)"
    @load="loaded = true"
  />
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { imageUrl } from "@/utils/r2";
import type { Image } from "@/types/manifest";

const props = defineProps<{
  image: Image;
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
}
</style>
