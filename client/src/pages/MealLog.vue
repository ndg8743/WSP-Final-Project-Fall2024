<template>
  <section class="section">
    <div class="container">
      <h1 class="title">Meal Log</h1>

      <form @submit.prevent="addMeal">
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

<script setup>
import { ref } from 'vue';
import MealCard from '@/components/MealCard.vue';

const meals = ref([]);

const newMeal = ref({
  name: '',
  calories: 0,
  date: ''
});

const addMeal = () => {
  if (newMeal.value.name && newMeal.value.calories && newMeal.value.date) {
    meals.value.push({
      ...newMeal.value,
      id: Date.now() 
    });
    resetForm();
  }
};

const editMeal = (meal) => {
  console.log("Editing meal:", meal); 
};

const deleteMeal = (mealId) => {
  meals.value = meals.value.filter((meal) => meal.id !== mealId);
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
