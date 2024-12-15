<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
// @ts-expect-error: Vue component typing
import ProgressBar from '../components/ProgressBar.vue'
import { getUserExercises } from '../models/exercises'
import { getSession } from '../models/login'

interface Statistics {
  completedExercises: number
  caloriesBurned: number
  exerciseGoal: number
  caloriesGoal: number
}

interface Session {
  user: {
    id: number
    [key: string]: any
  }
}

const router = useRouter()
const session = getSession() as Session
const isLoading = ref(false)
const error = ref('')
const notification = ref('')
const showProgress = ref(false)

// User-specific stats and goals
const stats = ref<Statistics>({
  completedExercises: 0,
  caloriesBurned: 0,
  exerciseGoal: Number(localStorage.getItem('exerciseGoal')) || 100,
  caloriesGoal: Number(localStorage.getItem('caloriesGoal')) || 5000
})

const validateGoals = (): boolean => {
  if (stats.value.exerciseGoal <= 0) {
    error.value = 'Exercise goal must be greater than 0'
    return false
  }
  if (stats.value.caloriesGoal <= 0) {
    error.value = 'Calories goal must be greater than 0'
    return false
  }
  return true
}

const saveGoals = () => {
  error.value = ''
  notification.value = ''

  if (!validateGoals()) return

  try {
    localStorage.setItem('exerciseGoal', stats.value.exerciseGoal.toString())
    localStorage.setItem('caloriesGoal', stats.value.caloriesGoal.toString())
    notification.value = 'Goals updated successfully!'
    
    // Reset progress bars to trigger animation
    showProgress.value = false
    setTimeout(() => {
      showProgress.value = true
    }, 300)
  } catch (err) {
    error.value = 'Failed to save goals. Please try again.'
  }
}

const fetchUserStats = async () => {
  if (!session.user) {
    router.push('/login')
    return
  }

  isLoading.value = true
  error.value = ''
  showProgress.value = false

  try {
    const response = await getUserExercises(session.user.id)
    if (response.isSuccess) {
      const userExercises = response.data
      stats.value.completedExercises = userExercises.length
      stats.value.caloriesBurned = userExercises.reduce(
        (total, exercise) => total + exercise.caloriesBurned, 
        0
      )
      // Delay showing progress bars to ensure animation
      setTimeout(() => {
        showProgress.value = true
      }, 300)
    } else {
      throw new Error(response.message || 'Failed to fetch exercises')
    }
  } catch (err) {
    error.value = err instanceof Error 
      ? err.message 
      : 'Failed to load statistics'
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchUserStats)
</script>

<template>
  <section class="section">
    <div class="container">
      <h1 class="title is-2">Your Exercise Statistics</h1>
      
      <div v-if="session.user">
        <div 
          v-if="error" 
          class="notification is-danger"
          role="alert"
        >
          {{ error }}
        </div>

        <div 
          v-if="notification" 
          class="notification is-success"
          role="alert"
        >
          {{ notification }}
        </div>

        <div 
          v-if="isLoading"
          class="notification is-info"
          role="status"
        >
          Loading your statistics...
        </div>

        <template v-else>
          <div class="box statistics-box full-width">
            <h2 class="title is-4">Set Your Goals</h2>
            <div class="field">
              <label class="label" for="exerciseGoal">Exercise Goal</label>
              <input 
                id="exerciseGoal"
                class="input is-medium" 
                type="number" 
                v-model="stats.exerciseGoal"
                min="1"
                aria-label="Set exercise goal"
              />
            </div>
            <div class="field">
              <label class="label" for="caloriesGoal">Calories Goal</label>
              <input 
                id="caloriesGoal"
                class="input is-medium" 
                type="number" 
                v-model="stats.caloriesGoal"
                min="1"
                aria-label="Set calories goal"
              />
            </div>
            <button 
              class="button is-success is-medium mt-4" 
              @click="saveGoals"
              aria-label="Save goals"
            >
              Save Goals
            </button>
          </div>

          <div class="box statistics-box full-width">
            <h2 class="title is-4">Total Exercises Completed</h2>
            <ProgressBar 
              v-if="showProgress"
              :value="stats.completedExercises" 
              :max="stats.exerciseGoal" 
            />
            <p class="is-size-4 mt-4" role="status">
              {{ stats.completedExercises.toLocaleString() }} / 
              {{ stats.exerciseGoal.toLocaleString() }} exercises completed
            </p>
          </div>

          <div class="box statistics-box full-width">
            <h2 class="title is-4">Total Calories Burned</h2>
            <ProgressBar 
              v-if="showProgress"
              :value="stats.caloriesBurned" 
              :max="stats.caloriesGoal"
              color="#ff9f43"
            />
            <p class="is-size-4 mt-4" role="status">
              {{ stats.caloriesBurned.toLocaleString() }} / 
              {{ stats.caloriesGoal.toLocaleString() }} calories burned
            </p>
          </div>
        </template>
      </div>

      <div 
        v-else
        class="notification is-danger"
        role="alert"
      >
        Please log in to view your exercise statistics.
      </div>
    </div>
  </section>
</template>

<style scoped>
.full-width {
  width: 100%;
  margin: 2rem 0;
  padding: 2rem;
}

.statistics-box {
  max-width: none;
}

.field {
  max-width: 400px;
}

.is-size-4 {
  font-weight: 500;
}
</style>
