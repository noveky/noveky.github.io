<script setup lang="ts">
import SiteMasthead from './SiteMasthead.vue'
import type { BlogPost } from './content'

defineProps<{
  post: BlogPost
}>()
</script>

<template>
  <div class="site-shell blog-shell">
    <SiteMasthead current="blog" />

    <main class="blog-post" aria-labelledby="post-title">
      <a class="back-link" href="/blog/">← All notes</a>
      <header class="post-header">
        <div class="post-meta">
          <time>{{ post.date }}</time>
          <span>{{ post.readingTime }}</span>
        </div>
        <h1 id="post-title">{{ post.title }}</h1>
        <p class="post-dek">{{ post.dek }}</p>
      </header>

      <article class="post-body" v-html="post.contentHtml"></article>
    </main>
  </div>
</template>
