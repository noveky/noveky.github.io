import '@fontsource-variable/libre-baskerville'
import { createApp } from 'vue'
import App from './App.vue'
import BlogIndex from './BlogIndex.vue'
import BlogPost from './BlogPost.vue'
import { findBlogPost } from './posts'
import './styles.css'

const path = window.location.pathname.replace(/\/+$/, '') || '/'

if (path === '/blog') {
  document.title = 'Noveky — Notes'
  createApp(BlogIndex).mount('#app')
} else if (path.startsWith('/blog/')) {
  const post = findBlogPost(path.slice('/blog/'.length))
  document.title = post ? `${post.title} — Noveky` : 'Noveky — Notes'
  createApp(post ? BlogPost : BlogIndex, post ? { post } : undefined).mount('#app')
} else {
  document.title = 'Noveky — Index'
  createApp(App).mount('#app')
}
