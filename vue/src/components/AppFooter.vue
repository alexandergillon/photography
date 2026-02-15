<!--
    AppFooter.vue

    Footer component, containing some links and a copyright notice.
-->
<template>
  <footer :class="{ mobile: isMobile }">
    <ul :class="{ mobile: isMobile }">
      <li :class="{ mobile: isMobile }">
        Check out my <TextLink href="https://www.instagram.com/alexgillon25" text="Instagram" />
      </li>

      <li :class="{ mobile: isMobile }">
        View source on <TextLink href="https://github.com/alexandergillon/photography" text="GitHub" />
      </li>

      <li :class="{ mobile: isMobile }">
        <span class="copyright">©</span> 2024 — {{ currentYear }} Alexander Gillon
      </li>
    </ul>
  </footer>
</template>

<script setup lang="ts">
import { useIsMobile } from "@/composables/isMobile";
import TextLink from "@/components/TextLink.vue";

const isMobile = useIsMobile();
const currentYear = new Date().getFullYear();
</script>

<style scoped>
footer {
  margin: calc(5 * var(--size-unit)) calc(1.5 * var(--size-unit)) calc(3 * var(--size-unit)) calc(1.5 * var(--size-unit));
}

footer:not(.mobile) {
  display: flex;
  justify-content: center;
  align-items: center;
}

ul {
  margin: 0;
  padding: 0;
  list-style-type: none;
  display: flex;
  align-items: center;
}

ul:not(.mobile) {
  --gap-size: 2rem;

  gap: var(--gap-size);
  justify-content: center;
}

ul.mobile {
  flex-direction: column;
}

li:not(.mobile) {
  display: inline-block;
  position: relative;
  font-size: calc(1.1 * var(--font-size-base));
}

li.mobile {
  margin: calc(0.5 * var(--size-unit-wide)) 0;
}

/* Add a slash between list items. */
li:not(:last-child):not(.mobile)::after {
  position: absolute;
  /* Moves the left edge of the slash box to the middle of the gap between items. */
  left: calc(100% + var(--gap-size) / 2);
  /* Moves the slash left by half its width, to center it. */
  transform: translateX(-50%);

  content: "/";
  font-size: calc(1.3 * var(--font-size-base));
}

.copyright {
  position: relative;
  top: 0.05rem;
  margin: 0;

  font-size: calc(1.2 * var(--font-size-base));
  font-family: Arial, sans-serif;
}
</style>
