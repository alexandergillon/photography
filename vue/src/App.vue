<template>
  <AppNavbar />

  <p v-for="i in Array.from({ length: 100 }, (_, i) => i + 1)">
    content
  </p>
  
  <AppFooter />
</template>

<script setup lang="ts">
import AppNavbar from '@/components/AppNavbar.vue';
import AppFooter from '@/components/AppFooter.vue';
</script>
