<template>
  <div class="container">
    <h1 class="title">Exercise Log</h1>
    <form @submit.prevent="logExercise">
      <div class="field">
        <label class="label">Date</label>
        <div class="control">
          <input class="input" type="date" v-model="date" />
        </div>
      </div>

      <div class="field">
        <label class="label">Exercise Type</label>
        <div class="control">
          <div class="select">
            <select v-model="exerciseType">
              <option>Running</option>
              <option>Cycling</option>
              <option>Swimming</option>
              <option>Weightlifting</option>
            </select>
          </div>
        </div>
      </div>

      <div class="field">
        <label class="label">Duration (minutes)</label>
        <div class="control">
          <input class="input" type="number" v-model="duration" placeholder="Enter duration" />
        </div>
      </div>

      <div class="control">
        <button class="button is-primary" type="submit">Log Exercise</button>
      </div>
    </form>

    <div class="exercise-list" v-if="exercises.length">
      <h2 class="subtitle">Exercise History</h2>
      <ul>
        <li v-for="exercise in exercises" :key="exercise.id">
          {{ exercise.date }} - {{ exercise.type }} - {{ exercise.duration }} mins
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const date = ref<string>('');
const exerciseType = ref<string>('Running');
const duration = ref<string>('');
const exercises = ref<Array<{ id: number; date: string; type: string; duration: string }>>([]);

function logExercise() {
  exercises.value.push({
    id: Date.now(),
    date: date.value,
    type: exerciseType.value,
    duration: duration.value,
  });
  clearForm();
}

function clearForm() {
  date.value = '';
  duration.value = '';
  exerciseType.value = 'Running';
}
</script>

<style scoped>
.container {
  max-width: 600px;
  margin: 0 auto;
}
.exercise-list {
  margin-top: 20px;
}
</style>