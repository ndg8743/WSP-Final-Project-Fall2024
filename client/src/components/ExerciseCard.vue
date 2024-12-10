<script setup lang="ts">
import type { Exercise } from '@/models/exercise.js';

defineProps<{
  exercise: Exercise;
}>();
</script>

<template>
  <div class="box">
    <h3>{{ exercise.name }}</h3>
    <p>Duration: {{ exercise.duration }} minutes</p>
    <p>Calories Burned: {{ exercise.caloriesBurned }} cal</p>
    <button class="button is-info" @click="$emit('edit', exercise)">Edit</button>
    <button class="button is-danger" @click="$emit('delete', exercise.id)">Delete</button>
  </div>
</template>

<style scoped>
.box {
  margin-bottom: 1rem;
  padding: 1rem;
  border: 1px solid #ccc;
}
</style>
