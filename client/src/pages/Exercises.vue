<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
// @ts-ignore
import ExerciseCard from '../components/ExerciseCard.vue'
// @ts-ignore
import Modal from '../components/Modal.vue'
import { getUserExercises, addExercise, type Exercise } from '../models/exercises.js'
import { getSession } from '../models/login.js'

const router = useRouter()
const session = getSession()

const exercises = ref<Exercise[]>([])
const filterDate = ref('')
const filteredExercises = ref<Exercise[]>([])
const currentExercise = ref<Partial<Exercise> | null>(null)
const showModal = ref(false)
const isLoading = ref(false)
const error = ref('')
const isAddingExercise = ref(false)

const filterExercises = () => {
  if (!exercises.value) {
    filteredExercises.value = []
    return
  }
  filteredExercises.value = filterDate.value
    ? exercises.value.filter(exercise => exercise.date === filterDate.value)
    : [...exercises.value]
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
}

const handleEdit = (exercise: Exercise) => {
  if (!session.token || !session.user?.id) {
    router.push('/login')
    return
  }

  currentExercise.value = { ...exercise }
  isAddingExercise.value = false
  showModal.value = true
}

const handleDelete = (id: number) => {
  if (!session.token || !session.user?.id) {
    router.push('/login')
    return
  }

  exercises.value = exercises.value.filter(exercise => exercise.id !== id)
  filterExercises()
}

const saveExercise = async () => {
  if (!session.token || !session.user?.id || !currentExercise.value) {
    router.push('/login')
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    if (isAddingExercise.value) {
      const response = await addExercise(currentExercise.value as Omit<Exercise, 'id'>)
      if (response.isSuccess && response.data) {
        exercises.value = exercises.value || []
        exercises.value.push(response.data)
      } else {
        error.value = response.message || 'Failed to add exercise'
      }
    } else {
      const index = exercises.value.findIndex(exercise => exercise.id === currentExercise.value!.id)
      if (index !== -1) exercises.value.splice(index, 1, currentExercise.value as Exercise)
    }
    closeModal()
    filterExercises()
  } catch (err) {
    console.error('Error saving exercise:', err)
    error.value = err instanceof Error ? err.message : 'An unexpected error occurred'
    if (err instanceof Error && err.message === 'Session expired') {
      router.push('/login')
    }
  } finally {
    isLoading.value = false
  }
}

const closeModal = () => {
  showModal.value = false
  currentExercise.value = null
}

onMounted(async () => {
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
      error.value = response.message || 'Error fetching exercises'
    }
  } catch (err) {
    console.error('Error fetching exercises:', err)
    error.value = err instanceof Error ? err.message : 'An unexpected error occurred'
    if (err instanceof Error && err.message === 'Session expired') {
      router.push('/login')
    }
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <section class="section">
    <div class="container">
      <h1 class="title">Exercises</h1>

      <div v-if="error" class="notification is-danger">
        {{ error }}
      </div>

      <div v-if="session.token && session.user">
        <button 
          class="button is-primary" 
          @click="openAddExercise"
          :disabled="isLoading"
        >
          Add New Exercise
        </button>

        <div class="mt-4">
          <div class="field">
            <label class="label">Filter by Date</label>
            <input 
              type="date" 
              class="input" 
              v-model="filterDate" 
              @change="filterExercises"
              :disabled="isLoading"
            />
          </div>
        </div>

        <div v-if="isLoading" class="mt-4">
          <progress class="progress is-small is-primary" max="100">Loading...</progress>
        </div>

        <div v-else>
          <div v-if="filteredExercises.length === 0" class="notification is-info mt-4">
            No exercises found.
          </div>

          <div v-else>
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
      <div v-else>
        <p class="notification is-danger">Please log in to view and manage exercises.</p>
      </div>
    </div>
  </section>

  <Modal v-if="showModal" @close="closeModal">
    <template #header>
      <p>{{ isAddingExercise ? 'Add Exercise' : 'Edit Exercise' }}</p>
    </template>
    <template #body>
      <template v-if="currentExercise">
        <div class="field">
          <label class="label">Exercise Name</label>
          <input 
            class="input" 
            v-model="currentExercise.name"
            :disabled="isLoading"
          />
        </div>
        <div class="field">
          <label class="label">Duration (minutes)</label>
          <input 
            class="input" 
            type="number" 
            v-model="currentExercise.duration"
            :disabled="isLoading"
          />
        </div>
        <div class="field">
          <label class="label">Calories Burned</label>
          <input 
            class="input" 
            type="number" 
            v-model="currentExercise.caloriesBurned"
            :disabled="isLoading"
          />
        </div>
        <div class="field">
          <label class="label">Date</label>
          <input 
            class="input" 
            type="date" 
            v-model="currentExercise.date"
            :disabled="isLoading"
          />
        </div>
      </template>
    </template>
    <template #footer>
      <button 
        class="button is-success" 
        @click="saveExercise"
        :class="{ 'is-loading': isLoading }"
        :disabled="isLoading"
      >
        Save
      </button>
      <button 
        class="button" 
        @click="closeModal"
        :disabled="isLoading"
      >
        Cancel
      </button>
    </template>
  </Modal>
</template>

<style scoped>
.section {
  padding-top: 2rem;
}

.notification {
  margin-top: 1rem;
}

.mt-4 {
  margin-top: 1rem;
}

.button + .button {
  margin-left: 0.5rem;
}
</style>
