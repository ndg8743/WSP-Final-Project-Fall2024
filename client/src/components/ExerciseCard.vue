<template>
    <div class="box">
      <h2 class="subtitle">{{ exercise.name }}</h2>
      <p>{{ exercise.description }}</p>
      <p><strong>Duration:</strong> {{ exercise.duration }} minutes</p>
      <p><strong>Calories Burned:</strong> {{ calculateCalories(exercise.duration) }} kcal</p>
      <button class="button is-info is-small" @click="editExercise">Edit</button>
      <button class="button is-danger is-small" @click="deleteExercise">Delete</button>
    </div>
  </template>
  
  <script setup>
  import { defineProps, defineEmits } from 'vue';
  
  const props = defineProps({
    exercise: Object
  });
  
  const emit = defineEmits(['edit', 'delete']);
  
  const calculateCalories = (duration) => {
    return duration * 8;
  };
  
  const editExercise = () => {
    emit('edit', props.exercise);
  };
  
  const deleteExercise = () => {
    emit('delete', props.exercise.id);
  };
  </script>
  
  <style scoped>
  .button {
    margin-right: 5px;
  }
  </style>
  