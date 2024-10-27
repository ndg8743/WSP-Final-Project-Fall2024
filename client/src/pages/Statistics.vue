<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { ref, onMounted } from 'vue';
import ProgressBar from '@/components/ProgressBar.vue';
import usersData from '@/data/users.json';
import exercisesData from '@/data/exercises.json';

const currentUserId = 1; // Replace with dynamic user ID as needed

// User-specific stats
const completedExercises = ref(0);
const caloriesBurned = ref(0);

onMounted(() => {
  // Fetch the exercises for the current user
  const userExercises = exercisesData.exercises.filter(exercise => exercise.userId === currentUserId);

  // Set the total completed exercises and total calories burned
  completedExercises.value = userExercises.length;
  caloriesBurned.value = userExercises.reduce((total, exercise) => total + exercise.caloriesBurned, 0);
});
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