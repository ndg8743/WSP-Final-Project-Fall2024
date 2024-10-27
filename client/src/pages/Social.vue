<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { ref, onMounted } from 'vue';
import FriendActivityCard from '@/components/FriendActivityCard.vue';
import usersData from '@/data/users.json';
import exercisesData from '@/data/exercises.json';
import mealsData from '@/data/meals.json';

// Set the current user ID here. Change this as needed to reflect the actual logged-in user.
const currentUserId = 1; // Replace with the ID of the logged-in user

// Store the data to display in the UI
const friendsActivities = ref([]);

// Helper functions to get recent activity and last meal for a given user
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
  // Find the current user in users.json
  const currentUser = usersData.find(user => user.id === currentUserId);

  // To display only friends:
  // Check if currentUser exists, then map over currentUser.friends to fetch friend data
  if (currentUser) {
    friendsActivities.value = currentUser.friends.map(friendId => {
      const friend = usersData.find(user => user.id === friendId);
      const recentActivity = getMostRecentActivity(friendId);
      const lastMeal = getLastMeal(friendId);

      return {
        id: friend.id,
        name: friend.name,
        avatar: friend.avatar, // Use avatar from users.json
        exercise: recentActivity.name,
        caloriesBurned: recentActivity.caloriesBurned,
        lastMeal: lastMeal.name,
        mealCalories: lastMeal.calories,
      };
    });
  }

  // To display all users instead of just friends:
  // Uncomment the code below and comment out the above block.
  /*
  friendsActivities.value = usersData.map(user => {
    const recentActivity = getMostRecentActivity(user.id);
    const lastMeal = getLastMeal(user.id);

    return {
      id: user.id,
      name: user.name,
      avatar: user.avatar, // Use avatar from users.json
      exercise: recentActivity.name,
      caloriesBurned: recentActivity.caloriesBurned,
      lastMeal: lastMeal.name,
      mealCalories: lastMeal.calories,
    };
  });
  */
});
</script>

<template>
  <section class="section">
    <div class="container">
      <h1 class="title">Social</h1>
      <FriendActivityCard
        v-for="friend in friendsActivities"
        :key="friend.id"
        :friend="friend"
      />
    </div>
  </section>
</template>

<style scoped>
.section {
  padding-top: 2rem;
}
</style>
