<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import type { Exercises } from '@/models/exercises';
import { api } from '@/models/myFetch';

const exercises = ref<Exercises | null>(null);
const router = useRouter();

onMounted(async () => {
  const session = localStorage.getItem('session');
  if (session) {
    const userId = JSON.parse(session).users.id;
    try {
      const response = await api<Exercises>(`exercises/${userId}`);
      exercises.value = response;
    } catch (error) {
      console.error('Error fetching exercise data:', error);
      router.push('/login');
    }
  } else {
    router.push('/login');
  }
});
</script>

<template>
  <div class="box" v-if="exercises">
    <h3>{{ exercises.name }}</h3>
    <p>Duration: {{ exercises.duration }} minutes</p>
    <p>Calories Burned: {{ exercises.calories }}</p>
    <button class="button is-info" @click="$emit('edit', exercises)">Edit</button>
    <button class="button is-danger" @click="$emit('delete', exercises.id)">Delete</button>
  </div>
</template>

<style scoped>
.box {
  margin-bottom: 1rem;
  padding: 1rem;
  border: 1px solid #ccc;
}
</style>
