<!--
  App.vue

  The main Vue application.
-->
<template>
  <ToastWrapper>
    <AppNavbar />

    <h1 class="main-font-wide">
      Alexander Gillon
    </h1>

    <template v-if="manifest">
      <div class="close-all">
        <HoverFilter filter="highlight-filter">
          <button class="main-font" @click="closeAll">
            Close All
          </button>
        </HoverFilter>
      </div>
      <ImageSeries
        v-for="(imageSeries, index) in manifest"
        ref="imageSeriesRefs"
        :key="imageSeries.uuid"
        :image-series="imageSeries"
        :index="index"
      />
    </template>

    <template v-else>
      Loading...
    </template>

    <AppFooter />
  </ToastWrapper>
</template>

<script setup lang="ts">
import { ref, useTemplateRef } from "vue";
import constants from "@/utils/constants";
import type { Manifest } from "@/types/manifest";
import { getManifest } from "@/utils/r2";
import AppNavbar from "@/components/AppNavbar.vue";
import AppFooter from "@/components/AppFooter.vue";
import HoverFilter from "@/components/HoverFilter.vue";
import ImageSeries from "@/components/ImageSeries.vue";
import ToastWrapper from "@/components/ToastWrapper.vue";

const manifest = ref<Manifest | null>(null);
const imageSeriesRefs = useTemplateRef("imageSeriesRefs");
const imageSeriesWidth = `${constants.IMAGE_SERIES_WIDTH_VW}vw`;

async function fetchManifest() {
  try {
    manifest.value = await getManifest();
  } catch (error) {
    console.error(error);
  }
}
fetchManifest(); // initial fetch

function closeAll() {
  imageSeriesRefs.value?.forEach((imageSeriesRef) => {
    imageSeriesRef?.close();
  });
}
</script>

<style scoped>
h1 {
  margin: 2rem auto 4rem auto;
  text-align: center;
  font-weight: normal;
  font-size: 6rem;
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
  font-size: 1.2rem;
  cursor: pointer;
}
</style>
