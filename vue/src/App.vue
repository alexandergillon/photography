<!--
  App.vue

  The main Vue application.
-->
<template>
  <SizeUnit />

  <ToastWrapper>
    <AppNavbar />

    <h1 class="main-font-wide">
      Alexander Gillon
    </h1>

    <template v-if="manifest">
      <div class="close-all" :class="{ mobile: isMobile }">
        <HoverFilter filter="highlight-filter">
          <button class="main-font" @click="closeAll">
            Close All
          </button>
        </HoverFilter>
      </div>
      <ImageSeries
        v-for="(imageSeries, index) in manifest"
        :ref="instance => handleImageSeriesRef(instance as ImageSeriesType, imageSeries.uuid, index)"
        :key="imageSeries.uuid"
        :image-series="imageSeries"
        :index="index"
      />
    </template>

    <template v-else>
      <div class="gallery-placeholder" />
    </template>

    <AppFooter />
  </ToastWrapper>
</template>

<script setup lang="ts">
import { nextTick, ref } from "vue";
import constants from "@/utils/constants";
import type { Manifest } from "@/types/manifest";
import type { ImageSeriesType } from "@/types/templateRef";
import { useIsMobile } from "@/composables/isMobile";
import { getManifest } from "@/utils/r2";
import { urlUuid } from "@/utils/url";
import AppNavbar from "@/components/AppNavbar.vue";
import AppFooter from "@/components/AppFooter.vue";
import HoverFilter from "@/components/HoverFilter.vue";
import ImageSeries from "@/components/ImageSeries.vue";
import ToastWrapper from "@/components/ToastWrapper.vue";
import SizeUnit from "@/components/SizeUnit.vue";

const isMobile = useIsMobile();
const manifest = ref<Manifest | null>(null);
const imageSeriesArray: Array<ImageSeriesType> = [];
const uuidToIndex: Map<string, number> = new Map();
const imageSeriesWidth = `${constants.IMAGE_SERIES_WIDTH_VW}vw`;

/**
 * Callback for Vue "ref" on ImageSeries components, to keep track of them for other functionality.
 * @param instance The ImageSeries component instance.
 * @param uuid UUID.
 * @param index Index.
 */
function handleImageSeriesRef(instance: ImageSeriesType, uuid: string, index: number) {
  uuidToIndex.set(uuid, index);
  imageSeriesArray[index] = instance;
}

async function fetchManifest() {
  try {
    manifest.value = await getManifest();

    // scrolls to inital image series, if one was directly linked to
    await nextTick();
    const initialUuid = urlUuid();
    if (initialUuid) {
      scrollTo(initialUuid);
    }
  } catch (error) {
    console.error(error);
  }
}
fetchManifest();

// Handles linking to image series while the page is already loaded (as changing only the hash does
// not trigger a full page load)
addEventListener("hashchange", () => {
  const uuid = urlUuid();
  if (uuid) {
    scrollTo(uuid);
  }
});

/**
 * Scrolls to an image series.
 * @param uuid UUID of the image series.
 */
function scrollTo(uuid: string) {
  const index = uuidToIndex.get(uuid);
  if (index !== undefined) {
    for (let i = 0; i <= index; i++) {
      imageSeriesArray[i]?.show();
    }
    imageSeriesArray[index]?.scrollAndOpen();
  }
}

/**
 * Closes all image series.
 */
function closeAll() {
  for (const imageSeries of imageSeriesArray) {
    imageSeries?.close();
  }
}
</script>

<style scoped>
h1 {
  margin: calc(2 * var(--size-unit-wide)) auto calc(4 * var(--size-unit-wide)) auto;
  max-width: 80vw;
  text-align: center;
  font-weight: normal;
  font-size: calc(6 * var(--font-size-base));
}

@keyframes pulseFade {
  0% {
    opacity: 0.25;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.25;
  }
}

.gallery-placeholder {
  width: v-bind(imageSeriesWidth);
  height: 30rem;
  margin: 2rem auto;
  background-color: var(--image-placeholder-color);
  animation: pulseFade 2s ease-in-out infinite;
}

.close-all {
  display: flex;
  justify-content: right;
  width: v-bind(imageSeriesWidth);
  margin: 0 auto;
}

.close-all button {
  padding: 0;
  border: 0;
  background: transparent;
  font-size: calc(1.25 * var(--font-size-base));
  cursor: pointer;
}

.close-all.mobile button {
  font-size: calc(1.75 * var(--font-size-base));
}
</style>
