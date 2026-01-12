<!--
  ImageSeries.vue

  Displays an image series, which is a title with a dropdown. The dropdown expands to show the images in the series.
-->
<template>
  <div class="image-series">
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
        <ImageRow v-for="(row, index) in imageSeries.rows" :key="index" :images="row" />
      </CollapsibleContent>
    </CollapsibleRoot>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import type { ImageSeries } from "@/types/manifest";
import { CollapsibleContent, CollapsibleRoot, CollapsibleTrigger } from "reka-ui";
import DropdownIcon from "@/components/DropdownIcon.vue";
import HoverFilter from "@/components/HoverFilter.vue";
import ImageRow from "@/components/ImageRow.vue";

const props = defineProps<{
  imageSeries: ImageSeries
}>();
const open = ref(false);

const titleId = computed(() => `image-series-${props.imageSeries.uuid}-title`);
const animationTime = `${300 * (props.imageSeries.rows.length ** 0.25)}ms`;
</script>

<style scoped>
.image-series {
  width: 80vw;
  margin: 1.75rem auto;
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
  animation: slideDown v-bind(animationTime) ease-out;
}
.image-series-content[data-state="closed"] {
  animation: slideUp v-bind(animationTime) ease-out;
}
</style>
