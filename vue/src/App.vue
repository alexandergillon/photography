<!--
  App.vue

  The main Vue application.
-->
<template>
  <AppNavbar />

  <h1 class="main-font-wide">
    Alexander Gillon
  </h1>

  <template v-if="manifest">
    <ImageSeries
      v-for="(imageSeries, index) in manifest"
      :key="imageSeries.uuid"
      :image-series="imageSeries"
      :index="index"
    />
  </template>

  <template v-else>
    Loading...
  </template>

  <AppFooter />
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { Manifest } from "@/types/manifest";
import { getManifest } from "@/utils/r2";
import AppNavbar from "@/components/AppNavbar.vue";
import AppFooter from "@/components/AppFooter.vue";
import ImageSeries from "@/components/ImageSeries.vue";

const manifest = ref<Manifest | null>(null);

async function fetchManifest() {
  try {
    manifest.value = await getManifest();
  } catch (error) {
    console.error(error);
  }
}

fetchManifest(); // initial fetch
</script>

<style scoped>
h1 {
  margin: 2rem auto 4rem auto;
  text-align: center;
  font-weight: normal;
  font-size: 6rem;
}
</style>
