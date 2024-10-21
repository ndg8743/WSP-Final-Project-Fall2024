<template>
    <div class="box">
      <h2 class="subtitle">{{ meal.name }}</h2>
      <p><strong>Calories:</strong> {{ meal.calories }} kcal</p>
      <p><strong>Description:</strong> {{ meal.description }}</p>
      <button class="button is-small is-info" @click="editMeal">Edit</button>
      <button class="button is-small is-danger" @click="deleteMeal">Delete</button>
    </div>
  </template>
  
  <script setup>
  import { defineProps, defineEmits } from 'vue';
  
  const props = defineProps({
    meal: Object,
  });
  
  const emit = defineEmits(['edit', 'delete']);
  
  const editMeal = () => {
    emit('edit', props.meal);
  };
  
  const deleteMeal = () => {
    emit('delete', props.meal.id);
  };
  </script>
  
  <style scoped>
  .button {
    margin-right: 5px;
  }
  </style>
  