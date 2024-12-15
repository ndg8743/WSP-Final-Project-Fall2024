<script setup lang="ts">
import type { Meal } from '../models/meals'
import { defineProps, defineEmits } from 'vue'

interface Props {
  /** Meal data to display */
  meal: Meal
}

interface Emits {
  (e: 'edit', meal: Meal): void
  (e: 'delete', mealId: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const formatDate = (date: string): string => {
  try {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch (error) {
    return 'Invalid date'
  }
}

const handleEdit = () => {
  emit('edit', props.meal)
}

const handleDelete = () => {
  if (confirm('Are you sure you want to delete this meal?')) {
    emit('delete', props.meal.id)
  }
}
</script>

<template>
  <div 
    class="box meal-card"
    role="article"
    aria-label="Meal entry"
  >
    <div class="meal-header">
      <h3 class="title is-5">{{ meal.name }}</h3>
      <span class="date">{{ formatDate(meal.date) }}</span>
    </div>

    <div class="meal-details">
      <p>
        <span class="icon has-text-info">
          <i class="fas fa-fire-alt"></i>
        </span>
        <strong>Calories:</strong> 
        {{ meal.mealCalories.toLocaleString() }} cal
      </p>
    </div>

    <div class="buttons mt-4">
      <button 
        class="button is-info is-small" 
        @click="handleEdit"
        title="Edit meal"
        aria-label="Edit meal"
      >
        <span class="icon">
          <i class="fas fa-edit"></i>
        </span>
        <span>Edit</span>
      </button>

      <button 
        class="button is-danger is-small" 
        @click="handleDelete"
        title="Delete meal"
        aria-label="Delete meal"
      >
        <span class="icon">
          <i class="fas fa-trash"></i>
        </span>
        <span>Delete</span>
      </button>
    </div>
  </div>
</template>
