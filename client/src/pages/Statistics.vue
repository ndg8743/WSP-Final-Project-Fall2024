<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { ref } from 'vue';
import ProgressBar from '@/components/ProgressBar.vue';

// Mock food data
const completedExercises = ref(50);
const caloriesBurned = ref(2500);
</script>

<template>
    <section class="section">
      <div class="container">
        <h1 class="title">Your Exercise Statistics</h1>
        <div class="box">
          <h2 class="subtitle">Total Exercises Completed</h2>
          <ProgressBar :value="completedExercises" max="100" />
        </div>
        <div class="box">
          <h2 class="subtitle">Total Calories Burned</h2>
          <ProgressBar :value="caloriesBurned" max="5000" />
        </div>
      </div>
    </section>
  </template>
  
<style scoped>
.section {
  padding-top: 2rem;
}
</style>
