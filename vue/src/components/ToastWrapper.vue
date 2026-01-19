<!--
  ToastWrapper.vue

  Wrapper component for setting up Reka toasts.
-->
<template>
  <ToastProvider :duration="2000">
    <slot />
    <ToastViewport class="toast-list" />
  </ToastProvider>
</template>

<script setup lang="ts">
import { ToastProvider, ToastViewport } from "reka-ui";
</script>

<style>
ol.toast-list {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  bottom: 2rem;
  padding: 0;
  list-style: none;
}
</style>
