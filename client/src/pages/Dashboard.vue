<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { ref, onMounted, watch } from 'vue'
import ProgressBar from '@/components/ProgressBar.vue'
import { getUserExercises } from '@/models/exercises'; // Import your model function

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
    try {
      // Fetch user exercises from the API
      const userExercises = await getUserExercises(currentUser.user.id)

      if (userExercises.data.length > 0) {
        // Sort exercises by the most recent one
        const sortedExercises = userExercises.data.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )

        // Set the last exercise details
        const recentExercise = sortedExercises[0]
        lastExercise.value = `${recentExercise.name} - ${recentExercise.duration} minutes`

        // Set exercise statistics
        totalExercises.value = sortedExercises.length
        completedExercises.value = Math.min(sortedExercises.length, exerciseGoal.value)
        caloriesBurned.value = sortedExercises.reduce((total, exercise) => total + exercise.caloriesBurned, 0)

        // Calculate combined progress as a percentage of the combined goal
        combinedProgress.value = Math.min(
          ((completedExercises.value / exerciseGoal.value) * 50) +
          ((caloriesBurned.value / caloriesGoal.value) * 50),
          100
        )
      }
    } catch (error) {
      console.error('Error fetching user exercises:', error)
    } finally {
      isLoading.value = false
    }
  }
})

// Watch for changes in goals and recalculate progress
watch([exerciseGoal, caloriesGoal], () => {
  combinedProgress.value = Math.min(
    ((completedExercises.value / exerciseGoal.value) * 50) +
    ((caloriesBurned.value / caloriesGoal.value) * 50),
    100
  )
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
