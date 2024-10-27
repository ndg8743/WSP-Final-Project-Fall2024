<!-- eslint-disable vue/multi-word-component-names -->
<!-- social.vue -->
<script setup>
import { ref, onMounted } from 'vue';
import FriendActivityCard from '@/components/FriendActivityCard.vue';
import usersData from '@/data/users.json';
import exercisesData from '@/data/exercises.json';
import mealsData from '@/data/meals.json';

// Store all users' activities
const allUserActivities = ref([]);

function getMostRecentActivity(userId) {
  const userActivities = exercisesData.exercises
    .filter(activity => activity.userId === userId)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  return userActivities.length ? userActivities[0] : { name: 'No recent activity', caloriesBurned: 0 };
}

function getLastMeal(userId) {
  const userMeals = mealsData
    .filter(meal => meal.userId === userId)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  return userMeals.length ? userMeals[0] : { name: 'No meal recorded', calories: 0 };
}

onMounted(() => {
  // Populate all users' activities and last meals
  allUserActivities.value = usersData.map(user => {
    const recentActivity = getMostRecentActivity(user.id);
    const lastMeal = getLastMeal(user.id);

    return {
      id: user.id,
      name: user.name,
      exercise: recentActivity.name,
      caloriesBurned: recentActivity.caloriesBurned,
      lastMeal: lastMeal.name,
      mealCalories: lastMeal.calories,
    };
  });
});
</script>

<template>
  <section class="section">
    <div class="container">
      <h1 class="title">Social</h1>
      <FriendActivityCard
        v-for="user in allUserActivities"
        :key="user.id"
        :friend="user"
      />
    </div>
  </section>
</template>

<style scoped>
.section {
  padding-top: 2rem;
}
</style>
