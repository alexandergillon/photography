<!--
  HoverFilter.vue

  Applies a CSS filter to slot content on hover. Also adds a pointer cursor.

  Props:
  - filter: CSS variable name, which contains a filter (e.g. 'link-color-filter')
-->
<template>
  <div class="hover-filter">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  filter: string;
}>();

const cssFilter = computed(() => `var(--${props.filter})`);
</script>

<style scoped>
.hover-filter {
  display: contents;
  cursor: pointer;
}

.hover-filter:hover,
.hover-filter:focus,
.hover-filter:hover:deep(*),
.hover-filter:focus:deep(*) {
  filter: v-bind(cssFilter);
  transition: var(--animation-transition);
}
</style>
