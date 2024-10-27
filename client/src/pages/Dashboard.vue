<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { ref } from 'vue';
import ProgressBar from '@/components/ProgressBar.vue';

const lastExercise = ref('Running - 30 minutes');
const totalExercises = ref(25);
const completedExercises = ref(50);
</script>

<template>
    <section class="section">
      <div class="container">
        <h1 class="title">Dashboard</h1>
        <div class="box">
          <h2 class="subtitle">Quick Overview</h2>
          <p>Last exercise: {{ lastExercise }}</p>
          <p>Total exercises completed: {{ totalExercises }}</p>
        </div>
        <div class="box">
          <h2 class="subtitle">Progress toward your goal</h2>
          <ProgressBar :value="completedExercises" max="100" />
        </div>
      </div>
    </section>
  </template>

<style scoped>
.section {
  padding-top: 2rem;
}
</style>