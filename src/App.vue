<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ArrowUpRight, Flower2, MessageSquareText, RefreshCw, Sparkles } from '@lucide/vue'
import LineStudy from './LineStudy.vue'
import SiteMasthead from './SiteMasthead.vue'
import { hostedServices, type HostedService, type ServiceStatus } from './services'

const publicServiceOrigin = 'https://noveky.cpolar.io'

const statuses = ref<Record<string, ServiceStatus>>({})
const isRefreshing = ref(false)

const availableCount = computed(() => (
  Object.values(statuses.value).filter((status) => status === 'available').length
))

function statusLabel(status: ServiceStatus | undefined) {
  if (status === 'available') return 'Available'
  if (status === 'unavailable') return 'Unavailable'
  return 'Checking'
}

function serviceHref(service: HostedService) {
  if (window.location.hostname === 'noveky.github.io') {
    return new URL(service.href, publicServiceOrigin).toString()
  }

  if (window.location.port !== '15173') return service.href

  const directUrl = new URL(service.href, window.location.href)
  directUrl.port = String(service.localPort)
  return directUrl.toString()
}

async function checkServices() {
  isRefreshing.value = true

  await Promise.all(hostedServices.map(async (service) => {
    statuses.value[service.href] = 'checking'
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 4000)
    const target = new URL(serviceHref(service), window.location.href)
    const isCrossOrigin = target.origin !== window.location.origin

    try {
      const response = await fetch(target, {
        method: 'HEAD',
        cache: 'no-store',
        mode: isCrossOrigin ? 'no-cors' : 'cors',
        signal: controller.signal,
      })
      statuses.value[service.href] = response.ok || response.type === 'opaque'
        ? 'available'
        : 'unavailable'
    } catch {
      statuses.value[service.href] = 'unavailable'
    } finally {
      window.clearTimeout(timeout)
    }
  }))

  isRefreshing.value = false
}

onMounted(checkServices)
</script>

<template>
  <div class="site-shell">
    <SiteMasthead current="home" />

    <main>
      <section class="introduction" aria-labelledby="page-title">
        <LineStudy />
        <div class="introduction-copy">
          <h1 id="page-title">noveky</h1>
          <blockquote class="epigraph">
            <p>Calculemus.</p>
            <cite>G. W. Leibniz</cite>
          </blockquote>
        </div>
      </section>

      <section class="directory" aria-labelledby="directory-title">
        <header class="directory-header">
          <div>
            <h2 id="directory-title">Projects</h2>
            <p aria-live="polite">
              {{ availableCount }} of {{ hostedServices.length }} available
            </p>
          </div>

          <button
            class="refresh-button"
            type="button"
            title="Refresh availability"
            aria-label="Refresh availability"
            :disabled="isRefreshing"
            @click="checkServices"
          >
            <RefreshCw :size="18" :class="{ spinning: isRefreshing }" aria-hidden="true" />
          </button>
        </header>

        <ul class="service-list">
          <li v-for="service in hostedServices" :key="service.href">
            <a class="service-link" :href="serviceHref(service)">
              <span class="service-leading">
                <span class="service-symbol" aria-hidden="true">
                  <Flower2 v-if="service.icon === 'flower'" :size="22" stroke-width="1.6" />
                  <MessageSquareText v-else-if="service.icon === 'novchat'" :size="22" stroke-width="1.6" />
                  <Sparkles v-else :size="22" stroke-width="1.6" />
                </span>
                <span class="service-copy">
                  <strong>{{ service.name }}</strong>
                  <span>{{ service.description }}</span>
                </span>
              </span>

              <span class="service-trailing">
                <span
                  class="availability"
                  :data-status="statuses[service.href] ?? 'checking'"
                >
                  <span class="availability-dot" aria-hidden="true" />
                  {{ statusLabel(statuses[service.href]) }}
                </span>
                <code>{{ service.path }}</code>
                <ArrowUpRight class="launch-icon" :size="22" aria-hidden="true" />
              </span>
            </a>
          </li>
        </ul>
      </section>
    </main>
  </div>
</template>
