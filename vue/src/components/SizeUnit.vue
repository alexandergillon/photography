<!--
  SizeUnit.vue

  Adds invisible divs, which do not affect the layout of the page, that calculate various size units and
  populate the useSizeUnit composable. See the header for that composable for more info.
-->
<template>
  <div ref="sizeUnitNarrow" class="size-unit-narrow" />
  <div ref="sizeUnit" class="size-unit" />
  <div ref="sizeUnitWide" class="size-unit-wide" />
</template>

<script setup lang="ts">
import { onMounted, useTemplateRef, watch } from "vue";
import { useWindowSize } from "@vueuse/core";
import { useSizeUnit } from "@/composables/sizeUnit";

const { width, height } = useWindowSize();
const { sizeUnitNarrow, sizeUnit, sizeUnitWide } = useSizeUnit();
const narrowDiv = useTemplateRef("sizeUnitNarrow");
const normalDiv = useTemplateRef("sizeUnit");
const wideDiv = useTemplateRef("sizeUnitWide");

function updateSizeUnits() {
  if (narrowDiv.value) {
    sizeUnitNarrow.value = window.getComputedStyle(narrowDiv.value).width;
  }
  if (normalDiv.value) {
    sizeUnit.value = window.getComputedStyle(normalDiv.value).width;
  }
  if (wideDiv.value) {
    sizeUnitWide.value = window.getComputedStyle(wideDiv.value).width;
  }
}

onMounted(updateSizeUnits);
watch([width, height], updateSizeUnits);
</script>

<style scoped>
.size-unit-narrow,
.size-unit,
.size-unit-wide {
  position: absolute;
  contain: strict;
  visibility: hidden;
  left: -9999px;
  top: -9999px;
}

.size-unit-narrow {
  width: var(--size-unit-narrow);
}

.size-unit {
  width: var(--size-unit);
}

.size-unit-wide {
  width: var(--size-unit-wide);
}
</style>
