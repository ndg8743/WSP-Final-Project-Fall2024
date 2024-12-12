<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ExerciseCard from '@/components/ExerciseCard.vue'
// @ts-ignore
import Modal from '@/components/Modal.vue'
import { getUserExercises, addExercise } from '@/models/exercises.js'
import type { Exercise } from '@/models/exercises'

// Retrieve the current user from session
const session = localStorage.getItem('session')
const currentUser = session ? JSON.parse(session) : null

const exercises = ref<Exercise[]>([])
const filterDate = ref('')
const filteredExercises = ref<Exercise[]>([])
const currentExercise = ref<Exercise | null>(null)
const showModal = ref(false)
const isAddingExercise = ref(false)

const filterExercises = () => {
  filteredExercises.value = filterDate.value
    ? exercises.value.filter(exercise => exercise.date === filterDate.value)
    : [...exercises.value]
}

const openAddExercise = () => {
  currentExercise.value = {
    id: Date.now(),
    name: '',
    duration: 0,
    caloriesBurned: 0,
    date: new Date().toISOString().split('T')[0],
    userId: currentUser ? currentUser.user.id : 0 // Set userId to current logged-in user
  }
  isAddingExercise.value = true
  showModal.value = true
}

const handleEdit = (exercise: Exercise) => {
  currentExercise.value = { ...exercise }
  isAddingExercise.value = false
  showModal.value = true
}

const handleDelete = (id: number) => {
  exercises.value = exercises.value.filter(exercise => exercise.id !== id)
  filterExercises()
}

const saveExercise = async () => {
  if (isAddingExercise.value) {
    try {
      const response = await addExercise(currentExercise.value!)
      if (response.isSuccess && response.data) {
        exercises.value.push(response.data)
      } else {
        console.error('Failed to add exercise:', response.message)
      }
    } catch (error) {
      console.error('Error adding exercise:', error)
    }
  } else {
    const index = exercises.value.findIndex(exercise => exercise.id === currentExercise.value!.id)
    if (index !== -1) exercises.value.splice(index, 1, { ...currentExercise.value! })
  }
  closeModal()
  filterExercises()
}

const closeModal = () => {
  showModal.value = false
}

onMounted(() => {
  if (currentUser) {
    getUserExercises(currentUser.user.id).then(response => {
      if (response.isSuccess && response.data) {
        exercises.value = response.data
        filterExercises()
      } else {
        console.error('Failed to fetch user exercises:', response.message)
      }
    }).catch(error => {
      console.error('Error fetching user exercises:', error)
    })
  }
})
</script>

<template>
  <section class="section">
    <div class="container">
      <h1 class="title">Exercises</h1>
      <div v-if="currentUser">
        <button class="button is-primary" @click="openAddExercise">Add New Exercise</button>
        <br />
        <br />
        <div class="field">
          <label class="label">Filter by Date</label>
          <input type="date" class="input" v-model="filterDate" @change="filterExercises" />
        </div>
        <div>
          <ExerciseCard v-for="exercise in filteredExercises" :key="exercise.id" :exercise="exercise" @edit="handleEdit"
            @delete="handleDelete" />
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
          <input class="input" v-model="currentExercise.name" />
        </div>
        <div class="field">
          <label class="label">Duration (minutes)</label>
          <input class="input" type="number" v-model="currentExercise.duration" />
        </div>
        <div class="field">
          <label class="label">Calories Burned</label>
          <input class="input" type="number" v-model="currentExercise.caloriesBurned" />
        </div>
        <div class="field">
          <label class="label">Date</label>
          <input class="input" type="date" v-model="currentExercise.date" />
        </div>
      </template>
    </template>
    <template #footer>
      <button class="button is-success" @click="saveExercise">Save</button>
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
</style>
