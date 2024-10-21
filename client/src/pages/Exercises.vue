<template>
    <section class="section">
      <div class="container">
        <h1 class="title">Exercise Log</h1>
        <div class="field">
          <label class="label">Filter by Date</label>
          <input type="date" class="input" v-model="filterDate" @change="filterExercises" />
        </div>
        <div>
          <ExerciseCard
            v-for="exercise in filteredExercises"
            :key="exercise.id"
            :exercise="exercise"
            @edit="handleEdit"
            @delete="handleDelete"
          />
        </div>
      </div>
    </section>
  
    <modal v-if="showModal" @close="closeModal">
      <template #header>
        <p>Edit Exercise</p>
      </template>
      <template #body>
        <div class="field">
          <label class="label">Exercise Name</label>
          <input class="input" v-model="currentExercise.name" />
        </div>
        <div class="field">
          <label class="label">Description</label>
          <input class="input" v-model="currentExercise.description" />
        </div>
        <div class="field">
          <label class="label">Duration (minutes)</label>
          <input class="input" type="number" v-model="currentExercise.duration" />
        </div>
      </template>
      <template #footer>
        <button class="button is-success" @click="saveExercise">Save</button>
      </template>
    </modal>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import ExerciseCard from '@/components/ExerciseCard.vue';
  import Modal from '@/components/Modal.vue';
  
  const exercises = ref([
    { id: 1, name: 'Jogging', description: 'Morning jog', duration: 30, date: '2024-10-20' },
    { id: 2, name: 'Yoga', description: 'Stretching exercises', duration: 45, date: '2024-10-19' },
  ]);
  
  const filterDate = ref('');
  const filteredExercises = ref([...exercises.value]);
  
  const currentExercise = ref(null);
  const showModal = ref(false);
  
  const filterExercises = () => {
    if (filterDate.value) {
      filteredExercises.value = exercises.value.filter(e => e.date === filterDate.value);
    } else {
      filteredExercises.value = [...exercises.value];
    }
  };
  
  const handleEdit = (exercise) => {
    currentExercise.value = { ...exercise };
    showModal.value = true;
  };
  
  const handleDelete = (id) => {
    exercises.value = exercises.value.filter(e => e.id !== id);
  };
  
  const saveExercise = () => {
    const index = exercises.value.findIndex(e => e.id === currentExercise.value.id);
    exercises.value.splice(index, 1, { ...currentExercise.value });
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
  