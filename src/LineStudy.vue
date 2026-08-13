<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const canvas = ref<HTMLCanvasElement | null>(null)

let frame = 0
let phase = 0
let width = 0
let height = 0
let pointerX = 0.68
let pointerY = 0.46
let resizeObserver: ResizeObserver | undefined
let motionQuery: MediaQueryList | undefined

function draw() {
  const element = canvas.value
  const context = element?.getContext('2d')

  if (!element || !context || width === 0 || height === 0) return

  context.clearRect(0, 0, width, height)
  context.lineWidth = Math.max(1, window.devicePixelRatio)

  const lineCount = 8
  const step = Math.max(3, width / 260)

  for (let line = 0; line < lineCount; line += 1) {
    const baseY = height * (0.12 + line * 0.108)
    const influenceY = (pointerY - 0.5) * height * 0.08

    context.beginPath()

    for (let x = -step; x <= width + step; x += step) {
      const normalizedX = x / width
      const distance = Math.abs(normalizedX - pointerX)
      const pointerInfluence = Math.max(0, 1 - distance * 4.2)
      const wave = Math.sin(x * 0.012 + phase + line * 0.7) * height * 0.018
      const counterWave = Math.cos(x * 0.004 - phase * 0.55 + line) * height * 0.012
      const y = baseY + wave + counterWave + influenceY * pointerInfluence

      if (x === -step) context.moveTo(x, y)
      else context.lineTo(x, y)
    }

    context.strokeStyle = line === 3
      ? 'oklch(0.40 0.11 250 / 0.56)'
      : 'oklch(0.14 0 0 / 0.16)'
    context.stroke()
  }

  context.fillStyle = 'oklch(0.14 0 0 / 0.46)'
  for (const [x, y] of [[0.18, 0.34], [0.54, 0.64], [0.82, 0.45]]) {
    context.beginPath()
    context.arc(width * x, height * y, Math.max(2, window.devicePixelRatio * 1.2), 0, Math.PI * 2)
    context.fill()
  }
}

function animate() {
  phase += 0.004
  draw()
  frame = window.requestAnimationFrame(animate)
}

function updateAnimation() {
  window.cancelAnimationFrame(frame)
  draw()

  if (!motionQuery?.matches) frame = window.requestAnimationFrame(animate)
}

function resize() {
  const element = canvas.value
  if (!element) return

  const bounds = element.getBoundingClientRect()
  const scale = Math.min(window.devicePixelRatio || 1, 2)
  width = Math.max(1, Math.floor(bounds.width * scale))
  height = Math.max(1, Math.floor(bounds.height * scale))
  element.width = width
  element.height = height
  draw()
}

function handlePointer(event: PointerEvent) {
  const bounds = canvas.value?.getBoundingClientRect()
  if (!bounds) return

  pointerX = (event.clientX - bounds.left) / bounds.width
  pointerY = (event.clientY - bounds.top) / bounds.height
}

onMounted(() => {
  if (!canvas.value) return

  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  motionQuery.addEventListener('change', updateAnimation)
  resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(canvas.value)
  resize()
  updateAnimation()
})

onBeforeUnmount(() => {
  window.cancelAnimationFrame(frame)
  resizeObserver?.disconnect()
  motionQuery?.removeEventListener('change', updateAnimation)
})
</script>

<template>
  <canvas
    ref="canvas"
    class="line-study"
    aria-hidden="true"
    @pointermove="handlePointer"
  />
</template>
