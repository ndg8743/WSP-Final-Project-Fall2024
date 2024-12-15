<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
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
const validationErrors = ref<string[]>([])
const isAddingMeal = ref(false)

// Validation computed properties
const getValidationErrors = computed(() => {
  const errors: string[] = []
  
  if (!currentMeal.value?.name?.trim()) {
    errors.push('Meal name is required')
  }
  
  if (currentMeal.value?.mealCalories && currentMeal.value.mealCalories < 0) {
    errors.push('Calories must be a positive number')
  }

  return errors
})

const isFormValid = computed(() => getValidationErrors.value.length === 0)

// Update validation errors when they change
watch(getValidationErrors, (newErrors) => {
  validationErrors.value = newErrors
})

const filterMeals = () => {
  if (!meals.value) {
    filteredMeals.value = []
    return
  }
  filteredMeals.value = filterDate.value
    ? meals.value.filter((meal) => meal.date === filterDate.value)
    : [...meals.value]
}

const loadMeals = async () => {
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
    error.value = err instanceof Error ? err.message : 'An unexpected error occurred'
    if (err instanceof Error && err.message === 'Session expired') {
      router.push('/login')
    }
  } finally {
    isLoading.value = false
  }
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
  validationErrors.value = []
}

const handleEdit = (meal: Meal) => {
  if (!session.token || !session.user?.id) {
    router.push('/login')
    return
  }

  currentMeal.value = { ...meal }
  isAddingMeal.value = false
  showModal.value = true
  validationErrors.value = []
}

const handleDelete = async (id: number) => {
  if (!session.token || !session.user?.id) {
    router.push('/login')
    return
  }

  await deleteMeal(id)
  await loadMeals()
  // Trigger dashboard refresh
  router.replace(router.currentRoute.value.fullPath)
}

const saveMeal = async () => {
  if (!session.token || !session.user?.id || !currentMeal.value) {
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
    if (isAddingMeal.value) {
      const response = await addMeal(currentMeal.value as Omit<Meal, 'id'>)
      if (response.isSuccess && response.data) {
        closeModal()
        await loadMeals() // Reload data after successful save
        // Trigger dashboard refresh
        router.replace(router.currentRoute.value.fullPath)
      } else {
        error.value = response.message || 'Failed to add meal'
      }
    } else {
      const index = meals.value.findIndex((meal) => meal.id === currentMeal.value!.id)
      if (index !== -1) {
        meals.value.splice(index, 1, currentMeal.value as Meal)
        closeModal()
        await loadMeals() // Reload data after successful update
        // Trigger dashboard refresh
        router.replace(router.currentRoute.value.fullPath)
      }
    }
  } catch (err) {
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
  validationErrors.value = []
  error.value = ''
}

onMounted(loadMeals)
</script>

<template>
  <section class="section">
    <div class="container">
      <h1 class="title">Meal Log</h1>

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
          @click="openAddMeal" 
          :disabled="isLoading"
          aria-label="Add new meal"
        >
          Add New Meal
        </button>

        <div class="mt-4">
          <div class="field">
            <label class="label" for="dateFilter">Filter by Date</label>
            <input
              id="dateFilter"
              type="date"
              class="input"
              v-model="filterDate"
              @change="filterMeals"
              :disabled="isLoading"
              aria-label="Filter meals by date"
            />
          </div>
        </div>

        <div 
          v-if="isLoading" 
          class="mt-4"
          role="status"
          aria-label="Loading meals"
        >
          <progress class="progress is-small is-primary" max="100">
            Loading...
          </progress>
        </div>

        <div v-else>
          <div 
            v-if="filteredMeals.length === 0" 
            class="notification is-info mt-4"
            role="status"
          >
            No meals found.
          </div>

          <div 
            v-else
            class="exercises-grid"
            role="list"
            aria-label="Meal list"
          >
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
      <div 
        v-else
        class="notification is-danger"
        role="alert"
      >
        Please log in to view and manage your meal log.
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
      <p id="modalTitle">{{ isAddingMeal ? 'Add Meal' : 'Edit Meal' }}</p>
    </template>
    <template #body>
      <template v-if="currentMeal">
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
          <label class="label" for="mealName">Meal Name *</label>
          <input 
            id="mealName"
            class="input" 
            v-model="currentMeal.name" 
            :disabled="isLoading"
            aria-required="true"
          />
        </div>
        <div class="field">
          <label class="label" for="mealCalories">Calories</label>
          <input
            id="mealCalories"
            class="input"
            type="number"
            v-model="currentMeal.mealCalories"
            :disabled="isLoading"
            min="0"
          />
        </div>
        <div class="field">
          <label class="label" for="mealDate">Date</label>
          <input 
            id="mealDate"
            class="input" 
            type="date" 
            v-model="currentMeal.date" 
            :disabled="isLoading"
          />
        </div>
        <p class="help">* Required fields</p>
      </template>
    </template>
    <template #footer>
      <button
        class="button is-success"
        @click="saveMeal"
        :class="{ 'is-loading': isLoading }"
        :disabled="isLoading || !isFormValid"
        aria-label="Save meal"
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
