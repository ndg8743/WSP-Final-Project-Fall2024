<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { ref, onMounted } from 'vue'
import ProgressBar from '@/components/ProgressBar.vue'
import { api } from '@/models/myFetch'

// Retrieve the current user from session
const session = localStorage.getItem('session')
const currentUser = session ? JSON.parse(session) : null

// User-specific data
const lastExercise = ref('')
const totalExercises = ref(0)
const completedExercises = ref(0)
const caloriesBurned = ref(0) // Track calories burned

// Goals for exercises and calories
const exerciseGoal = ref(localStorage.getItem('exerciseGoal') ? parseInt(localStorage.getItem('exerciseGoal')) : 100)
const caloriesGoal = ref(localStorage.getItem('caloriesGoal') ? parseInt(localStorage.getItem('caloriesGoal')) : 5000)
const combinedProgress = ref(0) // Combined progress percentage

onMounted(async () => {
  if (currentUser) {
    const currentUserId = currentUser.id

    // Fetch the exercises for the current user from the backend
    const userExercises = await api('exercises', { userId: currentUserId })

    // Set the last exercise, total exercises, completed exercises, and calories burned
    if (userExercises.length > 0) {
      const recentExercise = userExercises[0]
      lastExercise.value = `${recentExercise.name} - ${recentExercise.duration} minutes`
    } else {
      lastExercise.value = 'No recent exercise'
    }

    totalExercises.value = userExercises.length
    completedExercises.value = Math.min(userExercises.length, exerciseGoal.value)
    caloriesBurned.value = userExercises.reduce((total, exercise) => total + exercise.caloriesBurned, 0)

    // Calculate combined progress as a percentage of the combined goal
    combinedProgress.value = Math.min(
      ((completedExercises.value / exerciseGoal.value) * 50) +
      ((caloriesBurned.value / caloriesGoal.value) * 50),
      100
    )
  }
})
</script>

<template>
  <section class="section">
    <div class="container">
      <h1 class="title">Dashboard</h1>
      <div v-if="currentUser">
        <div class="box">
          <h2 class="subtitle">Quick Overview</h2>
          <p>Last exercise: {{ lastExercise }}</p>
          <p>Total exercises completed: {{ totalExercises }}</p>
          <p>Total calories burned: {{ caloriesBurned }}</p>
        </div>
        <div class="box">
          <h2 class="subtitle">Total Progress</h2>
          <ProgressBar :value="combinedProgress" max="100" />
          <p>{{ combinedProgress.toFixed(2) }}% of combined goal reached</p>
        </div>
      </div>
      <div v-else>
        <p class="notification is-danger">Please log in to view your dashboard.</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.section {
  padding-top: 2rem;
}
.notification {
  margin-top: 1rem;
}
</style>
