<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  value: {
    type: Number,
    required: true
  },
  max: {
    type: Number,
    required: true
  }
});
</script>

<template>
  <div class="progress-wrapper">
    <div class="progress-bar" :style="{ width: `${(value / max) * 100}%` }"></div>
  </div>
</template>

<style scoped>
.progress-wrapper {
  width: 100%;
  background-color: #ffffff30;
  /* Background color of the progress bar container */
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.progress-bar {
  height: 1rem;
  background-color: var(--bar-color, #1f191900);
  /* Use CSS custom property for dynamic color */
  width: var(--progress-width, 0);
  /* Dynamic width using custom property */
  transition: width 1s ease-in-out, background-color 0.3s ease-in-out;
  /* Smooth transition for both width and color */
}
</style>