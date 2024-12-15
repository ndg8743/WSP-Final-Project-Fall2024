<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import ExerciseCard from '../components/ExerciseCard.vue'
import Modal from '../components/Modal.vue'
import {
  getUserExercises,
  addExercise,
  deleteExercise,
  type Exercise
} from '../models/exercises'
import { getSession } from '../models/login'
interface Session {
  token: string
  user: {
    id: number
    [key: string]: any
  }
}

const router = useRouter()
const session = getSession() as Session

const exercises = ref<Exercise[]>([])
const filterDate = ref('')
const filteredExercises = ref<Exercise[]>([])
const currentExercise = ref<Partial<Exercise> | null>(null)
const showModal = ref(false)
const isLoading = ref(false)
const error = ref('')
const validationErrors = ref<string[]>([])
const isAddingExercise = ref(false)

// Validation computed properties
const getValidationErrors = computed(() => {
  const errors: string[] = []
  
  if (!currentExercise.value?.name?.trim()) {
    errors.push('Exercise name is required')
  }
  
  if (currentExercise.value?.duration && currentExercise.value.duration < 0) {
    errors.push('Duration must be a positive number')
  }
  
  if (currentExercise.value?.caloriesBurned && currentExercise.value.caloriesBurned < 0) {
    errors.push('Calories burned must be a positive number')
  }

  if (!currentExercise.value?.date) {
    errors.push('Date is required')
  }

  return errors
})

const isFormValid = computed(() => getValidationErrors.value.length === 0)

// Update validation errors when they change
watch(getValidationErrors, (newErrors) => {
  validationErrors.value = newErrors
})

const filterExercises = () => {
  if (!exercises.value) {
    filteredExercises.value = []
    return
  }
  filteredExercises.value = filterDate.value
    ? exercises.value.filter((exercise) => exercise.date === filterDate.value)
    : [...exercises.value].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )
}

const handleSessionError = (message: string) => {
  if (message === 'Session expired') {
    router.push('/login')
  }
}

const loadExercises = async () => {
  if (!session.token || !session.user?.id) {
    router.push('/login')
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    const response = await getUserExercises(session.user.id)
    if (response.isSuccess) {
      exercises.value = response.data || []
      filterExercises()
    } else {
      throw new Error(response.message || 'Error fetching exercises')
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An unexpected error occurred'
    handleSessionError(error.value)
  } finally {
    isLoading.value = false
  }
}

const openAddExercise = () => {
  if (!session.token || !session.user?.id) {
    router.push('/login')
    return
  }

  currentExercise.value = {
    name: '',
    duration: 0,
    caloriesBurned: 0,
    date: new Date().toISOString().split('T')[0],
    userId: session.user.id
  }
  isAddingExercise.value = true
  showModal.value = true
  validationErrors.value = []
}

const handleEdit = (exercise: Exercise) => {
  if (!session.token || !session.user?.id) {
    router.push('/login')
    return
  }

  currentExercise.value = { ...exercise }
  isAddingExercise.value = false
  showModal.value = true
  validationErrors.value = []
}

const handleDelete = async (id: number) => {
  if (!session.token || !session.user?.id) {
    router.push('/login')
    return
  }

  if (!confirm('Are you sure you want to delete this exercise?')) {
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    await deleteExercise(id)
    await loadExercises()
    router.replace(router.currentRoute.value.fullPath)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to delete exercise'
    handleSessionError(error.value)
  } finally {
    isLoading.value = false
  }
}

const saveExercise = async () => {
  if (!session.token || !session.user?.id || !currentExercise.value) {
    router.push('/login')
    return
  }

  if (!isFormValid.value) {
    error.value = 'Please fix the validation errors before saving'
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    if (isAddingExercise.value) {
      const response = await addExercise(currentExercise.value as Omit<Exercise, 'id'>)
      if (response.isSuccess && response.data) {
        closeModal()
        await loadExercises()
        router.replace(router.currentRoute.value.fullPath)
      } else {
        throw new Error(response.message || 'Failed to add exercise')
      }
    } else {
      const index = exercises.value.findIndex(
        (exercise) => exercise.id === currentExercise.value!.id
      )
      if (index !== -1) {
        exercises.value.splice(index, 1, currentExercise.value as Exercise)
        closeModal()
        await loadExercises()
        router.replace(router.currentRoute.value.fullPath)
      }
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An unexpected error occurred'
    handleSessionError(error.value)
  } finally {
    isLoading.value = false
  }
}

const closeModal = () => {
  showModal.value = false
  currentExercise.value = null
  validationErrors.value = []
  error.value = ''
}

onMounted(loadExercises)
</script>

<template>
  <section class="section">
    <div class="container">
      <h1 class="title">Exercises</h1>

      <div 
        v-if="error" 
        class="notification is-danger"
        role="alert"
      >
        {{ error }}
      </div>

      <div v-if="session.token && session.user">
        <button 
          class="button is-primary" 
          @click="openAddExercise" 
          :disabled="isLoading"
          aria-label="Add new exercise"
        >
          Add New Exercise
        </button>

        <div class="mt-4">
          <div class="field">
            <label class="label" for="dateFilter">Filter by Date</label>
            <input
              id="dateFilter"
              type="date"
              class="input"
              v-model="filterDate"
              @change="filterExercises"
              :disabled="isLoading"
              aria-label="Filter exercises by date"
            />
          </div>
        </div>

        <div 
          v-if="isLoading" 
          class="mt-4"
          role="status"
          aria-label="Loading exercises"
        >
          <progress class="progress is-small is-primary" max="100">
            Loading...
          </progress>
        </div>

        <div v-else>
          <div 
            v-if="filteredExercises.length === 0" 
            class="notification is-info mt-4"
            role="status"
          >
            No exercises found.
          </div>

          <div 
            v-else
            class="exercises-grid"
            role="list"
            aria-label="Exercise list"
          >
            <ExerciseCard
              v-for="exercise in filteredExercises"
              :key="exercise.id"
              :exercise="exercise"
              @edit="handleEdit"
              @delete="handleDelete"
            />
          </div>
        </div>
      </div>
      <div 
        v-else
        class="notification is-danger"
        role="alert"
      >
        Please log in to view and manage exercises.
      </div>
    </div>
  </section>

  <Modal 
    v-if="showModal" 
    @close="closeModal"
    role="dialog"
    aria-labelledby="modalTitle"
  >
    <template #header>
      <p id="modalTitle">{{ isAddingExercise ? 'Add Exercise' : 'Edit Exercise' }}</p>
    </template>
    <template #body>
      <template v-if="currentExercise">
        <div 
          v-if="validationErrors.length > 0" 
          class="notification is-warning"
          role="alert"
        >
          <ul>
            <li v-for="error in validationErrors" :key="error">{{ error }}</li>
          </ul>
        </div>

        <div class="field">
          <label class="label" for="exerciseName">Exercise Name *</label>
          <input 
            id="exerciseName"
            class="input" 
            v-model="currentExercise.name" 
            :disabled="isLoading"
            aria-required="true"
          />
        </div>
        <div class="field">
          <label class="label" for="exerciseDuration">Duration (minutes)</label>
          <input
            id="exerciseDuration"
            class="input"
            type="number"
            v-model="currentExercise.duration"
            :disabled="isLoading"
            min="0"
          />
        </div>
        <div class="field">
          <label class="label" for="exerciseCalories">Calories Burned</label>
          <input
            id="exerciseCalories"
            class="input"
            type="number"
            v-model="currentExercise.caloriesBurned"
            :disabled="isLoading"
            min="0"
          />
        </div>
        <div class="field">
          <label class="label" for="exerciseDate">Date *</label>
          <input 
            id="exerciseDate"
            class="input" 
            type="date" 
            v-model="currentExercise.date" 
            :disabled="isLoading"
            aria-required="true"
          />
        </div>
        <p class="help">* Required fields</p>
      </template>
    </template>
    <template #footer>
      <button
        class="button is-success"
        @click="saveExercise"
        :class="{ 'is-loading': isLoading }"
        :disabled="isLoading || !isFormValid"
        aria-label="Save exercise"
      >
        Save
      </button>
      <button 
        class="button" 
        @click="closeModal" 
        :disabled="isLoading"
        aria-label="Cancel"
      >
        Cancel
      </button>
    </template>
  </Modal>
</template>
