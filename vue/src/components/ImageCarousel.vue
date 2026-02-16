<!--
  ImageCarousel.vue

  Displays an image carousel, for displaying an image series on mobile.
-->
<template>
  <div class="image-series-carousel">
    <div :id="carouselId" class="f-carousel">
      <div v-for="image in images" :key="image.key" class="f-carousel__slide">
        <div class="image-series-carousel-image">
          <GalleryImage :series-uuid="imageSeries.uuid" :image="image" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { Carousel } from "@fancyapps/ui/dist/carousel";
import { Dots } from "@fancyapps/ui/dist/carousel/carousel.dots.js";
import type { Image, ImageSeries } from "@/types/manifest";
import GalleryImage from "@/components/GalleryImage.vue";
import { useSizeUnit } from "@/composables/sizeUnit";

const props = defineProps<{ imageSeries: ImageSeries }>();
const { sizeUnit } = useSizeUnit();

const carouselId = computed(() => `${props.imageSeries.uuid}-carousel`);
const images = computed<Array<Image>>(() => {
  const result: Array<Image> = [];
  props.imageSeries.rows.forEach(row => result.push(...row));
  return result;
});
const gap = computed(() => `${sizeUnit.value * 3}px`);

onMounted(() => {
  const container = document.getElementById(carouselId.value);
  const options = {
    Dots: {
      dynamicFrom: 5,
      dynamicPadd: 2,
    },
    style: {
      "--f-carousel-dots-height": "calc(6 * var(--size-unit))",
    },
  };
  const plugins = { Dots };
  Carousel(container, options, plugins).init();
});
</script>

<style scoped>
.image-series-carousel {
  width: 100%;
}

/* Centers the image on the slide, as images within a series have variable heights. */
.image-series-carousel-image {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* fancyapps Carousel v6 can't handle complex CSS values, so we have to use JS to get value. */
.image-series-carousel .f-carousel {
  --f-carousel-gap: v-bind(gap);
}
</style>
