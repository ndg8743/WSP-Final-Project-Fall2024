<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
// @ts-ignore
import ProgressBar from '../components/ProgressBar.vue'
import { getUserExercises, type Exercise } from '../models/exercises.js'
import { getUserMeals, type Meal } from '../models/meals.js'
import { getSession } from '../models/login.js'

const router = useRouter()
const route = useRoute()
const session = getSession()

// User-specific data
const lastExercise = ref('')
const totalExercises = ref(0)
const completedExercises = ref(0)
const caloriesBurned = ref(0)
const mealCalories = ref(0)
const netCalorieBalance = ref(0)
const isLoading = ref(true) // Start with loading true
const error = ref('')

// Goals with proper type conversion
const exerciseGoal = ref(Number(localStorage.getItem('exerciseGoal')) || 100)
const caloriesGoal = ref(Number(localStorage.getItem('caloriesGoal')) || 5000)

// Initialize progress values to 0
const exerciseProgress = ref(0)
const caloriesProgress = ref(0)
const combinedProgress = ref(0)

// Timer and Stopwatch
const timer = ref(0)
const stopwatch = ref(0)
const timerInterval = ref<number | null>(null)
const stopwatchInterval = ref<number | null>(null)

// Helper functions to format time
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const startTimer = () => {
  if (!timerInterval.value && timer.value > 0) {
    timerInterval.value = window.setInterval(() => {
      if (timer.value > 0) {
        timer.value -= 1
      } else {
        stopTimer()
      }
    }, 1000)
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
  timer.value += 60
}

const decrementTimer = () => {
  if (timer.value >= 60) {
    timer.value -= 60
  }
}

const startStopwatch = () => {
  if (!stopwatchInterval.value) {
    stopwatchInterval.value = window.setInterval(() => {
      stopwatch.value++
    }, 1000)
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

// Calculate progress values
const calculateProgress = () => {
  const exercisePercent = (completedExercises.value / exerciseGoal.value) * 50
  const caloriesPercent = (caloriesBurned.value / caloriesGoal.value) * 50
  
  // Update progress values with a slight delay to ensure animation
  setTimeout(() => {
    exerciseProgress.value = exercisePercent
    caloriesProgress.value = caloriesPercent
    combinedProgress.value = Math.min(exercisePercent + caloriesPercent, 100)
  }, 100)
}

// Fetch user data
const fetchUserData = async () => {
  if (!session.token || !session.user?.id) {
    router.push('/login')
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    // Reset progress values to 0 before fetching new data
    exerciseProgress.value = 0
    caloriesProgress.value = 0
    combinedProgress.value = 0

    // Fetch user exercises
    const exercisesResponse = await getUserExercises(session.user.id)
    if (exercisesResponse.isSuccess && exercisesResponse.data.length > 0) {
      const sortedExercises = exercisesResponse.data.sort(
        (a: Exercise, b: Exercise) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
      const recentExercise = sortedExercises[0]
      lastExercise.value = `${recentExercise.name} - ${recentExercise.duration} minutes`
      totalExercises.value = sortedExercises.length
      completedExercises.value = Math.min(sortedExercises.length, exerciseGoal.value)
      caloriesBurned.value = sortedExercises.reduce((total: number, exercise: Exercise) => total + exercise.caloriesBurned, 0)
    } else {
      lastExercise.value = 'No exercises recorded'
      totalExercises.value = 0
      completedExercises.value = 0
      caloriesBurned.value = 0
    }

    // Fetch user meals
    const mealsResponse = await getUserMeals(session.user.id)
    if (mealsResponse.isSuccess && mealsResponse.data.length > 0) {
      mealCalories.value = mealsResponse.data.reduce((total: number, meal: Meal) => total + meal.mealCalories, 0)
    } else {
      mealCalories.value = 0
    }

    // Calculate net calorie balance
    netCalorieBalance.value = mealCalories.value - caloriesBurned.value
    
    // Calculate progress after data is loaded
    calculateProgress()
  } catch (err) {
    console.error('Error fetching user data:', err)
    error.value = err instanceof Error ? err.message : 'An error occurred while fetching data'
    if (err instanceof Error && err.message === 'Session expired') {
      router.push('/login')
    }
  } finally {
    isLoading.value = false
  }
}

// Lifecycle hooks
onMounted(() => {
  if (!session.token || !session.user?.id) {
    router.push('/login')
    return
  }
  fetchUserData()
})

// Watch for route changes to refresh data
watch(
  () => route.fullPath,
  () => {
    fetchUserData()
  }
)

// Watchers
watch([exerciseGoal, caloriesGoal], () => {
  // Save to localStorage
  localStorage.setItem('exerciseGoal', exerciseGoal.value.toString())
  localStorage.setItem('caloriesGoal', caloriesGoal.value.toString())
  // Recalculate progress when goals change
  calculateProgress()
})

// Watch for session changes
watch(() => session.token, (newToken) => {
  if (!newToken) {
    router.push('/login')
  }
})
</script>

<template>
  <section class="section">
    <div class="container">
      <h1 class="title">Dashboard</h1>

      <div v-if="error" class="notification is-danger">
        {{ error }}
      </div>

      <div v-if="session.token && session.user">
        <div v-if="isLoading" class="mt-4">
          <progress class="progress is-small is-primary" max="100">Loading...</progress>
        </div>

        <template v-else>
          <div class="box">
            <h2 class="subtitle">Quick Overview</h2>
            <p>Last exercise: {{ lastExercise || 'No exercises recorded' }}</p>
            <p>Total exercises completed: {{ totalExercises }}</p>
            <p>Total calories burned: {{ caloriesBurned }}</p>
            <p>Total meal calories: {{ mealCalories }}</p>
          </div>

          <div class="box">
            <h2 class="subtitle">Total Progress</h2>
            <ProgressBar :value="combinedProgress" :max="100" />
            <p>{{ combinedProgress.toFixed(2) }}% of combined goal reached</p>
            <p>Net Calorie Balance: {{ netCalorieBalance }}</p>
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
        </template>
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
}

.button.is-danger.is-red {
  background-color: #ffffff !important;
  color: #000000 !important;
}

.button.is-danger.is-light {
  background-color: #0748ba !important;
  color: #ffffff !important;
}

.mt-4 {
  margin-top: 1rem;
}
</style>
