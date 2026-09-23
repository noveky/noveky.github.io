<script setup lang="ts">
defineProps<{
  current?: 'home' | 'blog'
}>()
</script>

<template>
  <header class="masthead">
    <a class="identity" href="/" aria-label="Noveky home">
      <span class="identity-mark" aria-hidden="true">Π</span>
      <span>noveky</span>
    </a>

    <nav class="site-nav" aria-label="Primary navigation">
      <a :class="{ active: current === 'blog' }" href="/blog/">Notes</a>
    </nav>
  </header>
</template>
