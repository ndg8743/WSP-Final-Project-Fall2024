<!-- eslint-disable vue/multi-word-component-names -->
 <script setup>
import { ref, onMounted } from 'vue';
import ProgressBar from '@/components/ProgressBar.vue';
import { api } from '@/models/myFetch';

const session = localStorage.getItem('session');
const currentUser = session ? JSON.parse(session).users : null;

const lastExercise = ref('No recent exercise');
const totalExercises = ref(0);
const caloriesBurned = ref(0);

onMounted(async () => {
  if (currentUser) {
    console.log('Fetching dashboard data for user:', currentUser.id);
    const currentUserId = currentUser.id;

    try {
      const response = await api(`exercises?userId=${currentUserId}`);
      if (response.isSuccess && response.data?.length) {
        totalExercises.value = response.data.length;
        caloriesBurned.value = response.data.reduce((sum, ex) => sum + ex.calories, 0);
        lastExercise.value = response.data[0].name || "No recent exercise";
        console.log('Dashboard data fetched:', { totalExercises: totalExercises.value, caloriesBurned: caloriesBurned.value, lastExercise: lastExercise.value });
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    }
  }
});
</script>

<template>
  <section class="section">
    <div class="container">
      <h1 class="title">Dashboard</h1>
      <div v-if="currentUser">
        <div class="box">
          <h2 class="subtitle">Quick Overview</h2>
          <p>Last Exercise: {{ lastExercise }}</p>
          <p>Total Exercises Completed: {{ totalExercises }}</p>
          <p>Total Calories Burned: {{ caloriesBurned }}</p>
        </div>
      </div>
      <div v-else>
        <p class="notification is-danger">Please log in to view your dashboard.</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.section {
  padding-top: 2rem;
}

.notification {
  margin-top: 1rem;
}
</style>
