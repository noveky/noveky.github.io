<script setup lang="ts">
import { blogPosts } from './content'
import SiteMasthead from './SiteMasthead.vue'
</script>

<template>
  <div class="site-shell blog-shell">
    <SiteMasthead current="blog" />

    <main class="blog-index" aria-labelledby="blog-title">
      <header class="blog-introduction">
        <p class="section-kicker">Personal notes</p>
        <h1 id="blog-title">Notes</h1>
        <p class="blog-lede">
          Occasional writing on making things, naming things, and leaving enough room
          for thought.
        </p>
      </header>

      <ol class="post-list">
        <li v-for="post in blogPosts" :key="post.slug">
          <a class="post-link" :href="`/blog/${post.slug}/`">
            <span class="post-meta">
              <time>{{ post.date }}</time>
              <span>{{ post.readingTime }}</span>
            </span>
            <span class="post-copy">
              <h2>{{ post.title }}</h2>
              <p>{{ post.dek }}</p>
            </span>
            <span class="post-arrow" aria-hidden="true">↗</span>
          </a>
        </li>
      </ol>
    </main>
  </div>
</template>
