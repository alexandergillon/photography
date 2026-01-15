<!--
  ImageSeries.vue

  Displays an image series, which is a title with a dropdown. The dropdown expands to show the images in the series.

  On initial page load, all image series that are on screen fade in, with a delay between each series (to create
  a "cascading" effect). Afterwards, image series fade in as you scroll down the page. The core logic for this is
  in the useIntersectionObserver composable.
-->
<template>
  <div ref="image-series" class="image-series">
    <CollapsibleRoot v-model:open="open">
      <div class="image-series-header">
        <!-- Title - clickable to toggle dropdown, and highlights on hover -->
        <CollapsibleTrigger as-child>
          <HoverFilter filter="highlight-filter">
            <h2 :id="titleId" class="image-series-title main-font-wide">
              {{ imageSeries.title }}
            </h2>
          </HoverFilter>
        </CollapsibleTrigger>

        <!-- Dropdown button - also clickable to toggle dropdown, and highlights on hover -->
        <CollapsibleTrigger as-child>
          <HoverFilter filter="highlight-filter">
            <button class="image-series-dropdown" :aria-pressed="open" :aria-describedby="titleId">
              <DropdownIcon :open="open" />
            </button>
          </HoverFilter>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent class="image-series-content">
        <ImageRow v-for="(row, rowIndex) in imageSeries.rows" :key="rowIndex" :series-uuid="imageSeries.uuid" :images="row" />
      </CollapsibleContent>
    </CollapsibleRoot>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, useTemplateRef, onMounted } from "vue";
import { CollapsibleContent, CollapsibleRoot, CollapsibleTrigger } from "reka-ui";
import type { ImageSeries } from "@/types/manifest";
import { useIntersectionObserver } from "@/composables/imageSeriesIntersectionObserver";
import DropdownIcon from "@/components/DropdownIcon.vue";
import HoverFilter from "@/components/HoverFilter.vue";
import ImageRow from "@/components/ImageRow.vue";

const props = defineProps<{
  imageSeries: ImageSeries, // Image series
  index: number, // Index among all the image series
}>();
const open = ref(false);
const titleId = computed(() => `image-series-${props.imageSeries.uuid}-title`);
const showSeriesAnimationTime = `${300 * (props.imageSeries.rows.length ** 0.25)}ms`;

// Observer manages the slide in animation when the element comes into view
const imageSeriesRef = useTemplateRef<HTMLDivElement>("image-series");
const observer = useIntersectionObserver();
onMounted(() => {
  observer.register(imageSeriesRef.value!, props.index);
});
</script>

<style scoped>
.image-series {
  --animation-time: 0.5s; /* fade-in animation time */
  /* delay between image series animations for the initial page load (see file header) */
  --animation-delay-initial-load: 0.1s;

  --image-series-width: 80vw;
  width: var(--image-series-width);
  margin: 1.75rem auto;
  opacity: 0; /* starts hidden and fades in */
}

@keyframes imageSeriesSlideIn {
  from {
    opacity: 0;
    translate: 0 -10%;
  }
  to {
    opacity: 1;
    translate: 0 0;
  }
}

.image-series.visible {
  animation-duration: var(--animation-time);
  animation-name: imageSeriesSlideIn;
  animation-timing-function: ease-in;
  animation-fill-mode: forwards; /* keeps opacity at 1 after animation is done */
}

.image-series-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.image-series-title {
  margin: 0;
  font-size: 2.25rem;
  font-weight: normal;
}

.image-series-dropdown {
  background: none;
  border: none;
  cursor: pointer;
}

@keyframes slideDown {
  from {
    height: 0;
  }
  to {
    height: var(--reka-collapsible-content-height);
  }
}

@keyframes slideUp {
  from {
    height: var(--reka-collapsible-content-height);
  }
  to {
    height: 0;
  }
}

.image-series-content {
  overflow: hidden;
}
.image-series-content[data-state="open"] {
  animation: slideDown v-bind(showSeriesAnimationTime) ease-out;
}
.image-series-content[data-state="closed"] {
  animation: slideUp v-bind(showSeriesAnimationTime) ease-out;
}
</style>
