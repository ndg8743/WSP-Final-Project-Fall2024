<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { ref, onMounted } from 'vue'
import ProgressBar from '@/components/ProgressBar.vue'
import exercisesData from '@/data/exercises.json'

// User-specific stats and goals
const completedExercises = ref(0)
const caloriesBurned = ref(0)
const exerciseGoal = ref(localStorage.getItem('exerciseGoal') ? parseInt(localStorage.getItem('exerciseGoal')) : 100)
const caloriesGoal = ref(localStorage.getItem('caloriesGoal') ? parseInt(localStorage.getItem('caloriesGoal')) : 5000)

// Retrieve the current user from session
const session = localStorage.getItem('session')
const currentUser = session ? JSON.parse(session) : null

// Fetch and calculate user stats
onMounted(() => {
  if (currentUser) {
    const currentUserId = currentUser.id

    // Fetch exercises for the current user
    const userExercises = exercisesData.exercises.filter(exercise => exercise.userId === currentUserId)

    // Set the total completed exercises and total calories burned
    completedExercises.value = userExercises.length
    caloriesBurned.value = userExercises.reduce((total, exercise) => total + exercise.caloriesBurned, 0)
  }
})

// Save goals to localStorage
const saveGoals = () => {
  localStorage.setItem('exerciseGoal', exerciseGoal.value.toString())
  localStorage.setItem('caloriesGoal', caloriesGoal.value.toString())
  alert('Goals updated!')
}
</script>

<template>
  <section class="section">
    <div class="container">
      <h1 class="title">Your Exercise Statistics</h1>
      <div v-if="currentUser">
        <div class="box">
          <h2 class="subtitle">Set Your Goals</h2>
          <div class="field">
            <label class="label">Exercise Goal</label>
            <input class="input" type="number" v-model="exerciseGoal" />
          </div>
          <div class="field">
            <label class="label">Calories Goal</label>
            <input class="input" type="number" v-model="caloriesGoal" />
          </div>
          <button class="button is-success" @click="saveGoals">Save Goals</button>
        </div>
        <div class="box">
          <h2 class="subtitle">Total Exercises Completed</h2>
          <ProgressBar :value="completedExercises" :max="exerciseGoal" />
          <p>{{ completedExercises }} / {{ exerciseGoal }} exercises completed</p>
        </div>
        <div class="box">
          <h2 class="subtitle">Total Calories Burned</h2>
          <ProgressBar :value="caloriesBurned" :max="caloriesGoal" />
          <p>{{ caloriesBurned }} / {{ caloriesGoal }} calories burned</p>
        </div>
      </div>
      <div v-else>
        <p class="notification is-danger">Please log in to view your exercise statistics.</p>
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
