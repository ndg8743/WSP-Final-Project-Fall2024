<script setup>
import { defineProps, computed } from 'vue';

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

// Ensure value does not exceed max
const adjustedValue = computed(() => Math.min(props.value || 0, props.max || 100));

// Dynamic class for color
const progressClass = computed(() => {
  const ratio = adjustedValue.value / props.max;
  return ratio >= 0.8 ? 'is-success' : ratio >= 0.5 ? 'is-warning' : 'is-primary';
});
</script>

<template>
  <progress class="progress" :class="progressClass" :value="adjustedValue" :max="max">
    {{ adjustedValue }}%
  </progress>
</template>

<style scoped>
.progress {
  margin-bottom: 1rem;
}
</style>
