<!--
  AppNavbar.vue

  Navigation bar with icon links elsewhere.
-->
<template>
  <nav>
    <ul>
      <li v-for="link in links" :key="link.href">
        <IconLink :iconSrc="link.iconSrc" :href="link.href" :alt="link.alt" :title="link.title" />
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import IconLink from '@/components/IconLink.vue';

const links = [
  {
    iconSrc: '/images/instagram-logo.svg',
    href: 'https://www.instagram.com/alexgillon25',
    alt: 'Instagram',
    title: 'Check out my Instagram',
  },
  {
    iconSrc: '/images/github-logo-purple.svg',
    href: 'https://github.com/alexandergillon/photography',
    alt: 'GitHub',
    title: 'View source on GitHub',
  },
];
</script>

<style scoped>
nav {
  margin: 1rem;
}

ul {
  margin: 0;
  padding: 0;
  list-style-type: none;

  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  align-items: center;
}

li {
  line-height: 0;
}
</style>