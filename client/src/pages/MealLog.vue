<template>
    <section class="section">
      <div class="container">
        <h1 class="title">Meal Log</h1>
        <MealCard
          v-for="meal in meals"
          :key="meal.id"
          :meal="meal"
          @edit="handleEdit"
          @delete="handleDelete"
        />
  
        <modal v-if="showModal" @close="closeModal">
          <template #header>
            <p>Edit Meal</p>
          </template>
          <template #body>
            <div class="field">
              <label class="label">Meal Name</label>
              <input class="input" v-model="currentMeal.name" />
            </div>
            <div class="field">
              <label class="label">Description</label>
              <input class="input" v-model="currentMeal.description" />
            </div>
            <div class="field">
              <label class="label">Calories (kcal)</label>
              <input class="input" type="number" v-model="currentMeal.calories" />
            </div>
          </template>
          <template #footer>
            <button class="button is-success" @click="saveMeal">Save</button>
          </template>
        </modal>
      </div>
    </section>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import MealCard from '@/components/MealCard.vue';
  import Modal from '@/components/Modal.vue';
  
  // Mock meal data
  const meals = ref([
    { id: 1, name: 'Breakfast', description: 'Oatmeal with fruits', calories: 400 },
    { id: 2, name: 'Lunch', description: 'Grilled chicken salad', calories: 600 },
  ]);
  
  const currentMeal = ref(null);
  const showModal = ref(false);
  
  const handleEdit = (meal) => {
    currentMeal.value = { ...meal };
    showModal.value = true;
  };
  
  const handleDelete = (id) => {
    meals.value = meals.value.filter(m => m.id !== id);
  };
  
  const saveMeal = () => {
    const index = meals.value.findIndex(m => m.id === currentMeal.value.id);
    meals.value.splice(index, 1, { ...currentMeal.value });
    closeModal();
  };
  
  const closeModal = () => {
    showModal.value = false;
  };
  </script>
  
  <style scoped>
  .section {
    padding-top: 2rem;
  }
  </style>
  