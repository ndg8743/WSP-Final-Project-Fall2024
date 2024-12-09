<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import type { Meals } from '@/models/meals.ts';

const props = defineProps<{
  meals: Meals;
}>();

const emit = defineEmits<{
  (e: 'edit', meals: Meals): void;
  (e: 'delete', mealId: number): void;
}>();

const handleEdit = () => {
  emit('edit', props.meals);
};

const handleDelete = () => {
  emit('delete', props.meals.id);
};
</script>

<template>
  <div class="box">
    <h3>{{ meals.name }}</h3>
    <p>Calories: {{ meals.calories }} kcal</p>
    <p>Date: {{ meals.date }}</p>
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
