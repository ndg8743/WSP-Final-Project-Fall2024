<script setup lang="ts">
import type { Exercise } from '../models/exercises'

interface Props {
  /** Exercise data to display */
  exercise: Exercise
}

interface Emits {
  (event: 'edit', exercise: Exercise): void
  (event: 'delete', id: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const handleDelete = () => {
  if (confirm('Are you sure you want to delete this exercise?')) {
    emit('delete', props.exercise.id)
  }
}

const formatDate = (date: string): string => {
  try {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Invalid date'
  }
}
</script>

<template>
  <div class="box exercise-card">
    <div class="exercise-header">
      <h3 class="title is-5">{{ exercise.name }}</h3>
      <div class="date">{{ formatDate(exercise.date) }}</div>
    </div>

    <div class="exercise-details">
      <div class="detail-item">
        <span class="icon">
          <i class="fas fa-clock"></i>
        </span>
        <span>{{ exercise.duration }} minutes</span>
      </div>

      <div class="detail-item">
        <span class="icon">
          <i class="fas fa-fire"></i>
        </span>
        <span>{{ exercise.caloriesBurned }} calories</span>
      </div>
    </div>

    <div class="buttons mt-4">
      <button 
        class="button is-info is-small" 
        @click="$emit('edit', exercise)"
        title="Edit exercise"
        aria-label="Edit exercise"
      >
        <span class="icon">
          <i class="fas fa-edit"></i>
        </span>
        <span>Edit</span>
      </button>

      <button 
        class="button is-danger is-small" 
        @click="handleDelete"
        title="Delete exercise"
        aria-label="Delete exercise"
      >
        <span class="icon">
          <i class="fas fa-trash"></i>
        </span>
        <span>Delete</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.exercise-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.exercise-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.icon {
  width: 20px;
  display: flex;
  justify-content: center;
}
</style>
