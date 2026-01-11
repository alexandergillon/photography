<!--
    AppFooter.vue

    Footer component, containing some links and a copyright notice.
-->
<template>
  <footer>
    <ul>
      <li>
        Check out my <TextLink href="https://www.instagram.com/alexgillon25" text="Instagram" />
      </li>

      <li>
        View source on <TextLink href="https://github.com/alexandergillon/photography" text="GitHub" />
      </li>

      <li>
        <span class="copyright">©</span> 2024 — {{ currentYear }} Alexander Gillon
      </li>
    </ul>
  </footer>
</template>

<script setup lang="ts">
import TextLink from "@/components/TextLink.vue";

const currentYear = new Date().getFullYear();
</script>

<style scoped>
footer {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 3rem 1.5rem;
}

ul {
  --gap-size: 2rem;

  margin: 0;
  padding: 0;
  list-style-type: none;

  display: flex;
  gap: var(--gap-size);
  justify-content: center;
  align-items: center;
}

li {
  display: inline-block;
  position: relative;
  font-size: 1.1rem;
}

/* Add a slash between list items. */
li:not(:last-child)::after {
  position: absolute;
  /* Moves the left edge of the slash box to the middle of the gap between items. */
  left: calc(100% + var(--gap-size) / 2);
  /* Moves the slash left by half its width, to center it. */
  transform: translateX(-50%);

  content: "/";
  font-size: 1.3rem;
}

.copyright {
  position: relative;
  top: 0.05rem;
  margin: 0;

  font-size: 1.2rem;
  font-family: Arial, sans-serif;
}
</style>
