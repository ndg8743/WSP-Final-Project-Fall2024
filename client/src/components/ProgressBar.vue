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
  <progress class="progress is-primary" :value="value" :max="max">{{ value }}%</progress>
</template>

<style scoped>
.progress {
  margin-bottom: 1rem;
}
</style>