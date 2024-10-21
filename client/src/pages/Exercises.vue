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
        <label class="label">Duration (minutes)</label>
        <input class="input" type="number" v-model="currentExercise.duration" />
      </div>
      <div class="field">
        <label class="label">Calories Burned</label>
        <input class="input" type="number" v-model="currentExercise.caloriesBurned" />
      </div>
    </template>
    <template #footer>
      <button class="button is-success" @click="saveExercise">Save</button>
    </template>
  </modal>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { getAll, Exercise } from '@/models/exercise';
import ExerciseCard from '@/components/ExerciseCard.vue';
import Modal from '@/components/Modal.vue';

const exercises = ref<Exercise[]>(getAll().data);
const filterDate = ref('');
const filteredExercises = ref([...exercises.value]);
const currentExercise = ref<Exercise | null>(null);
const showModal = ref(false);

const filterExercises = () => {
  if (filterDate.value) {
    filteredExercises.value = exercises.value.filter(e => e.date === filterDate.value);
  } else {
    filteredExercises.value = [...exercises.value];
  }
};

const handleEdit = (exercise: Exercise) => {
  currentExercise.value = { ...exercise };
  showModal.value = true;
};

const handleDelete = (id: number) => {
  exercises.value = exercises.value.filter(e => e.id !== id);
  filterExercises();
};

const saveExercise = () => {
  const index = exercises.value.findIndex(e => e.id === currentExercise.value!.id);
  exercises.value.splice(index, 1, { ...currentExercise.value! });
  closeModal();
  filterExercises();
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
