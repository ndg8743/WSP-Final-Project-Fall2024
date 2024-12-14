<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Component } from 'vue'
import ProgressBar from '../components/ProgressBar.vue'
import { getUserExercises } from '../models/exercises'
import { getSession } from '../models/login'

// User-specific stats and goals
const completedExercises = ref(0)
const caloriesBurned = ref(0)
const exerciseGoal = ref(Number(localStorage.getItem('exerciseGoal')) || 100)
const caloriesGoal = ref(Number(localStorage.getItem('caloriesGoal')) || 5000)

// Retrieve the current user from session
const session = getSession();

// Fetch and calculate user stats
onMounted(async () => {
  if (session.user) {
    const currentUserId = session.user.id

    try {
      // Fetch exercises from the API
      const response = await getUserExercises(currentUserId)
      if (response.isSuccess) {
        const userExercises = response.data

        // Set the total completed exercises and total calories burned
        completedExercises.value = userExercises.length
        caloriesBurned.value = userExercises.reduce((total, exercise) => total + exercise.caloriesBurned, 0)
      } else {
        console.error('Failed to fetch exercises:', response.message)
      }
    } catch (error) {
      console.error('Error fetching user exercises:', error)
    }
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
      <div v-if="session.user">
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
