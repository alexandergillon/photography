<!--
  TextToast.vue

  Creates a toast with text content.

  Props:
    - text: text to display

  Exposes an "open" function to show the toast.
-->
<template>
  <ToastRoot v-model:open="open" class="toast-root">
    <div class="toast-content">
      <ToastDescription as-child>
        {{ text }}
      </ToastDescription>

      <span class="toast-close">
        <ToastClose class="toast-close-button">
          <img src="/images/close.svg" alt="close">
        </ToastClose>
      </span>
    </div>
  </ToastRoot>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { ToastRoot, ToastDescription, ToastClose } from "reka-ui";

defineProps<{
  text: string;
}>();
const open = ref(false);

/* This is an approach from the Reka docs (https://reka-ui.com/docs/components/toast). It enables the toast to replay its animation
   when opened while already open. The idea is that you close the toast (if open), then open it again after a short delay. */
const timer = ref(0);
function openToast() {
  open.value = false;
  window.clearTimeout(timer.value);
  timer.value = window.setTimeout(() => open.value = true, 100);
}
defineExpose({ open: openToast });
</script>

<style scoped>
.toast-content {
  color: var(--toast-text-color);
  background-color: var(--toast-background-color);

  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid var(--toast-text-color);

  align-items: start;
}

.toast-close {
  margin-left: 0.5rem;
  padding-left: 0.5rem;
  border-left: 1px solid var(--toast-text-color);
}

img {
  height: 100%;
  position: relative;
  top: 0.05rem;
  filter: var(--toast-text-color-filter);
}
</style>


<style>
@keyframes slideUp {
  from {
    transform: translateY(20%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

/* Spaces out multiple toasts */
.toast-root {
  margin-top: 0.25rem;
}

.toast-root[data-state='open'] {
  animation: slideUp 200ms ease-out;
}

.toast-root[data-state='closed'] {
  animation: fadeOut 200ms ease-out;
}

button.toast-close-button {
  position: relative;
  background: transparent;
  cursor: pointer;
  padding: 0;
  border: none;
  height: 0.75rem;
}
</style>
