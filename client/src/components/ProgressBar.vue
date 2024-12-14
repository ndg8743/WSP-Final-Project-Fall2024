<script setup lang="ts">
import { defineProps, ref, watch, onMounted } from 'vue';

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

const width = ref(0);

// Use a watcher to animate the width change
watch(() => props.value, (newValue) => {
  width.value = (newValue / props.max) * 100;
}, { immediate: true });

// Set initial width to 0 to enable animation on mount
onMounted(() => {
  // Small delay to ensure transition works on initial load
  setTimeout(() => {
    width.value = (props.value / props.max) * 100;
  }, 100);
});
</script>

<template>
  <div class="progress-wrapper">
    <div 
      class="progress-bar" 
      :style="{ width: `${width}%` }"
    ></div>
  </div>
</template>

<style scoped>
.progress-wrapper {
  width: 100%;
  height: 1rem;
  background-color: #ffffff30;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.progress-bar {
  height: 100%;
  background-color: var(--bar-color, #00ff99d4);
  transform-origin: left;
  transition: width 1.5s ease-in-out;
  will-change: width;
  width: 0;
}
</style>
