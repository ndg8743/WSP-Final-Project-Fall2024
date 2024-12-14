<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
// @ts-ignore
import MealCard from '../components/MealCard.vue'
// @ts-ignore
import Modal from '../components/Modal.vue'
import { getUserMeals, addMeal, deleteMeal, type Meal } from '../models/meals.js'
import { getSession } from '../models/login.js'

const router = useRouter()
const session = getSession()

const meals = ref<Meal[]>([])
const filterDate = ref('')
const filteredMeals = ref<Meal[]>([])
const currentMeal = ref<Partial<Meal> | null>(null)
const showModal = ref(false)
const isLoading = ref(false)
const error = ref('')
const isAddingMeal = ref(false)

// Filter meals based on the selected date
const filterMeals = () => {
  if (!meals.value) {
    filteredMeals.value = []
    return
  }
  filteredMeals.value = filterDate.value
    ? meals.value.filter((meal) => meal.date === filterDate.value)
    : [...meals.value]
}

const openAddMeal = () => {
  if (!session.token || !session.user?.id) {
    router.push('/login')
    return
  }

  currentMeal.value = {
    name: '',
    mealCalories: 0,
    date: new Date().toISOString().split('T')[0],
    userId: session.user.id
  }
  isAddingMeal.value = true
  showModal.value = true
}

const handleEdit = (meal: Meal) => {
  if (!session.token || !session.user?.id) {
    router.push('/login')
    return
  }

  currentMeal.value = { ...meal }
  isAddingMeal.value = false
  showModal.value = true
}

const handleDelete = async (id: number) => {
  if (!session.token || !session.user?.id) {
    router.push('/login')
    return
  }

  meals.value = meals.value.filter((meal) => meal.id !== id)

  await Promise.all([deleteMeal(id), filterMeals()])
  // Trigger dashboard refresh
  router.replace(router.currentRoute.value.fullPath)
}

const saveMeal = async () => {
  if (!session.token || !session.user?.id || !currentMeal.value) {
    router.push('/login')
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    if (isAddingMeal.value) {
      const response = await addMeal(currentMeal.value as Omit<Meal, 'id'>)
      if (response.isSuccess && response.data) {
        meals.value = meals.value || []
        meals.value.push(response.data)
      } else {
        error.value = response.message || 'Failed to add meal'
      }
    } else {
      const index = meals.value.findIndex((meal) => meal.id === currentMeal.value!.id)
      if (index !== -1) meals.value.splice(index, 1, currentMeal.value as Meal)
    }
    closeModal()
    filterMeals()
    // Trigger dashboard refresh
    router.replace(router.currentRoute.value.fullPath)
  } catch (err) {
    console.error('Error saving meal:', err)
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
  currentMeal.value = null
}

onMounted(async () => {
  if (!session.token || !session.user?.id) {
    router.push('/login')
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    const response = await getUserMeals(session.user.id)
    if (response.isSuccess) {
      meals.value = response.data || []
      filterMeals()
    } else {
      error.value = response.message || 'Error fetching meals'
    }
  } catch (err) {
    console.error('Error fetching meals:', err)
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
      <h1 class="title">Meal Log</h1>

      <div v-if="error" class="notification is-danger">
        {{ error }}
      </div>

      <div v-if="session.token && session.user">
        <button class="button is-primary" @click="openAddMeal" :disabled="isLoading">
          Add New Meal
        </button>

        <div class="mt-4">
          <div class="field">
            <label class="label">Filter by Date</label>
            <input
              type="date"
              class="input"
              v-model="filterDate"
              @change="filterMeals"
              :disabled="isLoading"
            />
          </div>
        </div>

        <div v-if="isLoading" class="mt-4">
          <progress class="progress is-small is-primary" max="100">Loading...</progress>
        </div>

        <div v-else>
          <div v-if="filteredMeals.length === 0" class="notification is-info mt-4">
            No meals found.
          </div>

          <div v-else>
            <MealCard
              v-for="meal in filteredMeals"
              :key="meal.id"
              :meal="meal"
              @edit="handleEdit"
              @delete="handleDelete"
            />
          </div>
        </div>
      </div>
      <div v-else>
        <p class="notification is-danger">Please log in to view and manage your meal log.</p>
      </div>
    </div>
  </section>

  <Modal v-if="showModal" @close="closeModal">
    <template #header>
      <p>{{ isAddingMeal ? 'Add Meal' : 'Edit Meal' }}</p>
    </template>
    <template #body>
      <template v-if="currentMeal">
        <div class="field">
          <label class="label">Meal Name</label>
          <input class="input" v-model="currentMeal.name" :disabled="isLoading" />
        </div>
        <div class="field">
          <label class="label">Calories</label>
          <input
            class="input"
            type="number"
            v-model="currentMeal.mealCalories"
            :disabled="isLoading"
          />
        </div>
        <div class="field">
          <label class="label">Date</label>
          <input class="input" type="date" v-model="currentMeal.date" :disabled="isLoading" />
        </div>
      </template>
    </template>
    <template #footer>
      <button
        class="button is-success"
        @click="saveMeal"
        :class="{ 'is-loading': isLoading }"
        :disabled="isLoading"
      >
        Save
      </button>
      <button class="button" @click="closeModal" :disabled="isLoading">Cancel</button>
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
