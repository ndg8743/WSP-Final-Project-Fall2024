<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { ref } from 'vue';
import ExerciseCard from '@/components/ExerciseCard.vue';
// @ts-ignore
import Modal from '@/components/Modal.vue';
import { getAll } from '@/models/exercise';
import type { Exercise } from '@/models/exercise';

const exercises = ref<Exercise[]>(getAll().data);
const filterDate = ref('');
const filteredExercises = ref([...exercises.value]);
const currentExercise = ref<Exercise | null>(null);
const showModal = ref(false);
const isAddingExercise = ref(false);

const filterExercises = () => {
  filteredExercises.value = filterDate.value
    ? exercises.value.filter(exercise => exercise.date === filterDate.value)
    : [...exercises.value];
};

const openAddExercise = () => {
  currentExercise.value = { id: Date.now(), name: '', duration: 0, caloriesBurned: 0, date: '', userId: 0 };
  isAddingExercise.value = true;
  showModal.value = true;
};

const handleEdit = (exercise: Exercise) => {
  currentExercise.value = { ...exercise };
  isAddingExercise.value = false;
  showModal.value = true;
};

const handleDelete = (id: number) => {
  exercises.value = exercises.value.filter(exercise => exercise.id !== id);
  filterExercises();
};

const saveExercise = () => {
  if (isAddingExercise.value) {
    exercises.value.push({ ...currentExercise.value! });
  } else {
    const index = exercises.value.findIndex(exercise => exercise.id === currentExercise.value!.id);
    if (index !== -1) exercises.value.splice(index, 1, { ...currentExercise.value! });
  }
  closeModal();
  filterExercises();
};

const closeModal = () => {
  showModal.value = false;
};
</script>

<template>
  <section class="section">
    <div class="container">
      <h1 class="title">Exercises</h1>
      <button class="button is-primary" @click="openAddExercise">Add New Exercise</button>
      <br>
      <br>
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

  <Modal v-if="showModal" @close="closeModal">
    <template #header>
      <p>{{ isAddingExercise ? 'Add Exercise' : 'Edit Exercise' }}</p>
    </template>
    <template #body>
      <template v-if="currentExercise">
        <div class="field">
          <label class="label">Exercise Name</label>
          <input class="input" v-model="currentExercise.name" />
        </div>
        <div class="field">
          <label class="label">Duration (minutes)</label>
          <input class="input" type="number" v-model="currentExercise.duration" />
        </div>
        <div class="field">
          <label class="label">Calories Burned</label>
          <input class="input" type="number" v-model="currentExercise.caloriesBurned" />
        </div>
      </template>
    </template>
    <template #footer>
      <button class="button is-success" @click="saveExercise">Save</button>
    </template>
  </Modal>
</template>

<style scoped>
.section {
  padding-top: 2rem;
}
</style>
