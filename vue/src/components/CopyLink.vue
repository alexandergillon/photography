<!--
  CopyLink.vue

  Creates a "copy link" button that copies a link to an image series. Displays a toast to show the user the link was copied.

  Props:
    - uuid: UUID of the image series to link to
-->
<template>
  <HoverFilter filter="highlight-filter">
    <button @click="copyLink">
      <img :class="{ mobile: isMobile }" src="/images/link.svg" alt="copy link to image series">
    </button>
  </HoverFilter>
  <TextToast ref="toast" text="Link Copied" />
</template>

<script setup lang="ts">
import { useTemplateRef } from "vue";
import { uuidUrl } from "@/utils/url";
import HoverFilter from "@/components/HoverFilter.vue";
import TextToast from "@/components/TextToast.vue";
import { useIsMobile } from "@/composables/isMobile";

const props = defineProps<{
  uuid: string;
}>();
const toast = useTemplateRef("toast");
const isMobile = useIsMobile();

function copyLink() {
  navigator.clipboard.writeText(uuidUrl(props.uuid));
  toast.value?.open();
}
</script>

<style scoped>
button {
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
}

img {
  height: calc(1.25 * var(--size-unit));
  position: relative;
  top: 0.15rem;
}

img.mobile {
  height: calc(2.5 * var(--size-unit));
}
</style>
