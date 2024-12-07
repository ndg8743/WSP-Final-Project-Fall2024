<script setup lang="ts">
import type { Meal } from '@/models/meals.ts';
import { defineProps, defineEmits } from 'vue';

const props = defineProps<{
  meal: Meal;
}>();

const emit = defineEmits<{
  (e: 'edit', meal: Meal): void;
  (e: 'delete', mealId: number): void;
}>();

const handleEdit = () => {
  emit('edit', props.meal);
};

const handleDelete = () => {
  emit('delete', props.meal.id);
};
</script>

<template>
  <div class="box">
    <h3>{{ meal.name }}</h3>
    <p>Calories: {{ meal.calories }} kcal</p>
    <p>Date: {{ meal.date }}</p>
    <button class="button is-info" @click="handleEdit">Edit</button>
    <button class="button is-danger" @click="handleDelete">Delete</button>
  </div>
</template>

<style scoped>
.box {
  margin-bottom: 1rem;
  padding: 1rem;
  border: 1px solid #ccc;
}
</style>
