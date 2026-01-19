<!--
  ExternalLinkIcon.vue

  Displays an external link icon, inline with text.
-->
<template>
  <img src="/images/external-link.svg" alt="link icon">
</template>

<style scoped>
img {
  position: relative;
  top: -0.1rem; /* link icon is not really 'centered' at the source in the way that we want it, so move it up a little */
  vertical-align: middle;
  height: 0.75rem;
}
</style>
