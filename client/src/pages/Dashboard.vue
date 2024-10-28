<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { ref, onMounted } from 'vue'
import ProgressBar from '@/components/ProgressBar.vue'
import exercisesData from '@/data/exercises.json'

// Retrieve the current user from session
const session = localStorage.getItem('session')
const currentUser = session ? JSON.parse(session) : null

// User-specific data
const lastExercise = ref('')
const totalExercises = ref(0)
const completedExercises = ref(0)

onMounted(() => {
  if (currentUser) {
    const currentUserId = currentUser.id

    // Fetch the exercises for the current user
    const userExercises = exercisesData.exercises
      .filter(exercise => exercise.userId === currentUserId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Sort by date for the latest exercise

    // Set the last exercise, total exercises, and completed exercises
    if (userExercises.length > 0) {
      const recentExercise = userExercises[0]
      lastExercise.value = `${recentExercise.name} - ${recentExercise.duration} minutes`
    } else {
      lastExercise.value = 'No recent exercise'
    }
    totalExercises.value = userExercises.length
    completedExercises.value = Math.min(userExercises.length, 100) // Example: limit to 100 for progress bar
  }
})
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
