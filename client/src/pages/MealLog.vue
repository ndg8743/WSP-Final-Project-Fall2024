<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
// @ts-ignore
import MealCard from '@/components/MealCard.vue'
// @ts-ignore
import Modal from '@/components/Modal.vue'
import { getMeals } from '@/models/meals'
import type { Meals } from '@/models/meals.js'

// Retrieve the current user from the session
const session = localStorage.getItem('session')
const currentUser = session ? JSON.parse(session) : null

const meals = ref<Meals[]>([])
const filterDate = ref('')
const filteredMeals = ref<Meals[]>([])
const currentMeal = ref<Meals | null>(null)
const showModal = ref(false)
const isAddingMeal = ref(false) // Flag for add mode

// Filter meals based on the selected date
const filterMeals = () => {
  filteredMeals.value = filterDate.value
    ? meals.value.filter(meal => meal.date === filterDate.value)
    : [...meals.value]
}

const openAddMeal = () => {
  currentMeal.value = { id: Date.now(), name: '', calories: 0, date: '', userId: currentUser.user.id }
  isAddingMeal.value = true
  showModal.value = true
}

const handleEdit = (meal: Meals) => {
  currentMeal.value = { ...meal }
  isAddingMeal.value = false
  showModal.value = true
}

const handleDelete = (id: number) => {
  meals.value = meals.value.filter(meal => meal.id !== id)
  filterMeals()
}

const saveMeal = () => {
  if (isAddingMeal.value) {
    meals.value.push({ ...currentMeal.value! })
  } else {
    const index = meals.value.findIndex(meal => meal.id === currentMeal.value!.id)
    if (index !== -1) meals.value.splice(index, 1, { ...currentMeal.value! })
  }
  closeModal()
  filterMeals()
}

const closeModal = () => {
  showModal.value = false
}

// Load current user's meals on component mount
onMounted(() => {
  if (currentUser) {
    getMeals().then(response => {
      meals.value = response.data.filter((meal: Meals) => meal.userId === currentUser.user.id)
      filterMeals() // Initialize filteredMeals based on the loaded data
    })
  }
})
</script>

<template>
  <section class="section">
    <div class="container">
      <h1 class="title">Meal Log</h1>
      <div v-if="currentUser">
        <button class="button is-primary" @click="openAddMeal">Add New Meal</button>
        <br />
        <br />
        <div class="field">
          <label class="label">Filter by Date</label>
          <input type="date" class="input" v-model="filterDate" @change="filterMeals" />
        </div>
        <div>
          <MealCard
            v-for="meal in filteredMeals"
            :key="meal.id"
            :meal="meal"
            @edit="handleEdit"
            @delete="handleDelete"
          />
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
          <input class="input" v-model="currentMeal.name" />
        </div>
        <div class="field">
          <label class="label">Calories</label>
          <input class="input" type="number" v-model="currentMeal.mealCalories" />
        </div>
        <div class="field">
          <label class="label">Date</label>
          <input class="input" type="date" v-model="currentMeal.date" />
        </div>
      </template>
    </template>
    <template #footer>
      <button class="button is-success" @click="saveMeal">Save</button>
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
