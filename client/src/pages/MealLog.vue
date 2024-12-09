<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import MealCard from '@/components/MealCard.vue';
import Modal from '@/components/Modal.vue';
import { getMeals, addMeal, updateMeal, deleteMeal } from '@/models/meals';
import type { Meals } from '@/models/meals';

// Retrieve the current user from the session
const session = localStorage.getItem('session');
const currentUser = session ? JSON.parse(session).users : null;

const meals = ref<Meals[]>([]);
const filterDate = ref('');
const filteredMeals = ref<Meals[]>([]);
const currentMeal = ref<Meals | null>(null);
const showModal = ref(false);
const isAddingMeal = ref(false); // Flag for add mode

// Filter meals based on the selected date
const filterMeals = () => {
  filteredMeals.value = filterDate.value
    ? meals.value.filter((meal) => meal.date === filterDate.value)
    : [...meals.value];
};

const openAddMeal = () => {
  console.log('Opening add meal modal');
  currentMeal.value = { id: Date.now(), name: '', calories: 0, date: '', user_id: currentUser.id };
  isAddingMeal.value = true;
  showModal.value = true;
};

const handleEdit = (meals: Meals) => {
  console.log('Editing meal:', meals);
  currentMeal.value = { ...meals };
  isAddingMeal.value = false;
  showModal.value = true;
};

const handleDelete = async (id: number) => {
  console.log('Deleting meal with id:', id);
  try {
    await deleteMeal(id);
    meals.value = meals.value.filter(meals => meals.id !== id);
    filterMeals();
  } catch (err) {
    console.error('Error deleting meal:', err);
  } finally {
    console.log('Delete operation completed');
  }
};

const saveMeal = async () => {
  console.log('Saving meal:', currentMeal.value);
  try {
    if (isAddingMeal.value) {
      const response = await addMeal(currentMeal.value!);
      meals.value.push(response.data);
    } else {
      const response = await updateMeal(currentMeal.value!.id, currentMeal.value!);
      const index = meals.value.findIndex(meals => meals.id === currentMeal.value!.id);
      if (index !== -1) meals.value.splice(index, 1, response.data);
    }
    closeModal();
    filterMeals();
  } catch (err) {
    console.error('Error saving meal:', err);
  }
};

const closeModal = () => {
  showModal.value = false;
};

// Load current user's meals on component mount
onMounted(async () => {
  if (currentUser) {
    try {
      const mealsResponse = await getMeals();
      meals.value = mealsResponse.data.filter((meal) => meal.user_id === currentUser.id);
      filterMeals(); // Initialize filteredMeals based on the loaded data
    } catch (err) {
      console.error('Error loading meals:', err);
    }
  }
});
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
            v-for="meals in filteredMeals"
            :key="meals.id"
            :meals="meals"
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
          <input class="input" type="number" v-model="currentMeal.calories" />
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
