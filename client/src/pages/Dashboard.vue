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

// Timer and Stopwatch
const timer = ref(0) // Timer in seconds
const stopwatch = ref(0) // Stopwatch in seconds
const timerInterval = ref(null)
const stopwatchInterval = ref(null)

// Helper functions to format time
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const startTimer = () => {
  if (!timerInterval.value && timer.value > 0) {
    timerInterval.value = setInterval(() => {
      if (timer.value > 0) {
        timer.value -= 1 // Decrement the timer in seconds
      } else {
        stopTimer() // Stop when it reaches 0
      }
    }, 1000) // Update every second
  }
}

const stopTimer = () => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
    timerInterval.value = null
  }
}

const resetTimer = () => {
  stopTimer()
  timer.value = 0
}

const incrementTimer = () => {
  timer.value += 60 // Increment by 1 minute
}

const decrementTimer = () => {
  if (timer.value >= 60) {
    timer.value -= 60 // Decrement by 1 minute
  }
}

const startStopwatch = () => {
  if (!stopwatchInterval.value) {
    stopwatchInterval.value = setInterval(() => {
      stopwatch.value++
    }, 1000) // 1-second interval
  }
}

const stopStopwatch = () => {
  if (stopwatchInterval.value) {
    clearInterval(stopwatchInterval.value)
    stopwatchInterval.value = null
  }
}

const resetStopwatch = () => {
  stopStopwatch()
  stopwatch.value = 0
}

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
        <div class="box">
          <h2 class="subtitle">Timer</h2>
          <div class="timer-controls">
            <button class="button is-info" @click="decrementTimer">-</button>
            <p class="timer-value">{{ formatTime(timer) }}</p>
            <button class="button is-info" @click="incrementTimer">+</button>
          </div>
          <div class="buttons is-centered">
            <button class="button is-primary" @click="startTimer">Start</button>
            <button class="button is-red is-light" @click="stopTimer">Stop</button>
            <button class="button is-danger is-light" @click="resetTimer">Reset</button>
          </div>
        </div>
        <div class="box">
          <h2 class="subtitle">Stopwatch</h2>
          <div class="timer-controls">
            <p class="timer-value">{{ formatTime(stopwatch) }}</p>
          </div>
          <div class="buttons is-centered">
            <button class="button is-primary" @click="startStopwatch">Start</button>
            <button class="button is-danger is-red" @click="stopStopwatch">Stop</button>
            <button class="button is-danger is-light" @click="resetStopwatch">Reset</button>
          </div>
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

.timer-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.timer-value {
  font-size: 1.5rem;
  font-weight: bold;
}

.buttons {
  margin-top: 1rem;
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  /* Center the buttons */
}

.button.is-danger.is-red {
  background-color: #ffffff !important;
  /* Light red background */
  color: #000000 !important;
  /* Dark red text */
}

.button.is-danger.is-light {
  background-color: #0748ba !important;
  /* Light red background */
  color: #ffffff !important;
  /* Dark red text */
}
</style>
