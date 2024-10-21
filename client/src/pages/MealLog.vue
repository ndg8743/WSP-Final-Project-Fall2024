<template>
  <section class="section">
    <div class="container">
      <h1 class="title">Meal Log</h1>

      <form @submit.prevent="addMeal">
        <!-- Form for adding meals -->
        <div class="field">
          <label class="label">Meal Name</label>
          <div class="control">
            <input class="input" type="text" v-model="newMeal.name" placeholder="Enter meal name" />
          </div>
        </div>

        <div class="field">
          <label class="label">Calories</label>
          <div class="control">
            <input class="input" type="number" v-model="newMeal.calories" placeholder="Enter calories" />
          </div>
        </div>

        <div class="field">
          <label class="label">Date</label>
          <div class="control">
            <input class="input" type="date" v-model="newMeal.date" />
          </div>
        </div>

        <div class="control">
          <button class="button is-primary" type="submit">Add Meal</button>
        </div>
      </form>

      <hr>

      <h2 class="subtitle">Logged Meals</h2>
      <div v-if="meals.length > 0">
        <ul>
          <li v-for="meal in meals" :key="meal.id">
            <MealCard :meal="meal" @edit="editMeal" @delete="deleteMeal" />
          </li>
        </ul>
      </div>
      <div v-else>
        <p>No meals logged yet.</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import MealCard from '@/components/MealCard.vue';
import { getAll, Meal } from '@/models/meals'; // Import meals from the meals.ts

// Initialize the meals array with data from meals.json
const meals = ref<Meal[]>(getAll().data);

const newMeal = ref({
  name: '',
  calories: 0,
  date: '',
  id: 0 // Default ID for a new meal
});

const addMeal = () => {
  if (newMeal.value.name && newMeal.value.calories && newMeal.value.date) {
    meals.value.push({
      ...newMeal.value,
      id: Date.now() // Assign a new ID for each meal
    });
    resetForm();
  }
};

const editMeal = (meal: Meal) => {
  const index = meals.value.findIndex(m => m.id === meal.id);
  if (index !== -1) {
    newMeal.value = { ...meal }; // Populate the form with the selected meal for editing
  }
};

const deleteMeal = (mealId: number) => {
  meals.value = meals.value.filter(meal => meal.id !== mealId);
};

const resetForm = () => {
  newMeal.value.name = '';
  newMeal.value.calories = 0;
  newMeal.value.date = '';
};
</script>

<style scoped>
.container {
  max-width: 600px;
  margin: 0 auto;
}
</style>
