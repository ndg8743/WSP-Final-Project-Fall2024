<script setup lang="ts">
import { ref, watch, onMounted, withDefaults } from 'vue'

interface Props {
  /** Current value of the progress bar (must be >= 0) */
  value: number
  /** Maximum value for the progress bar (must be > 0) */
  max: number
  /** Color of the progress bar (CSS color value) */
  color?: string
}

// Validate props with defaults
const props = withDefaults(defineProps<Props>(), {
  color: '#00ff99d4'
})

const width = ref<number>(0)

// Calculate percentage with bounds checking
const calculatePercentage = (value: number, max: number): number => {
  // Ensure valid values
  const safeValue = Math.max(0, value)
  const safeMax = Math.max(1, max)
  const percentage = (safeValue / safeMax) * 100
  return Math.min(Math.max(percentage, 0), 100) // Ensure between 0-100
}

// Use a watcher to animate the width change
watch(() => props.value, (newValue: number) => {
  width.value = calculatePercentage(newValue, props.max)
}, { immediate: false }) // Don't set immediately to allow animation

// Set initial width to 0 to enable animation on mount
onMounted(() => {
  // Start at 0
  width.value = 0
  
  // Delay to ensure transition works
  setTimeout(() => {
    width.value = calculatePercentage(props.value, props.max)
  }, 300) // Longer delay for more noticeable animation
})
</script>

<template>
  <div 
    class="progress-wrapper"
    role="progressbar"
    :aria-valuenow="value"
    :aria-valuemin="0"
    :aria-valuemax="max"
  >
    <div 
      class="progress-bar" 
      :style="{ 
        width: `${width}%`,
        backgroundColor: color
      }"
    ></div>
  </div>
</template>

<style scoped>
.progress-wrapper {
  width: 100%;
  height: 1.5rem;
  border-radius: 8px;
  overflow: hidden;
  margin: 1.5rem 0;
  background-color: var(--progress-bg, rgba(255, 255, 255, 0.2));
}

.progress-bar {
  height: 100%;
  border-radius: 8px;
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: width;
}

html.dark .progress-wrapper {
  background-color: var(--progress-bg-dark, rgba(255, 255, 255, 0.1));
}
</style>
