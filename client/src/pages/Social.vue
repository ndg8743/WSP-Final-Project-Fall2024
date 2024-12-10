<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { ref, onMounted } from 'vue'
import FriendActivityCard from '@/components/FriendActivityCard.vue'
import { getUserExercises } from '@/models/exercises'; // Import your model function
import { getUsers } from '@/models/users'; // Import your model function
import { getUserMeals } from '@/models/meals';

// Retrieve current user from session token
const session = localStorage.getItem('session')
const currentUser = session ? JSON.parse(session) : null

// Store the data to display in the UI
const friendsActivities = ref([])

// Helper functions to get recent activity and last meal for a given user
async function getMostRecentActivity(userId) {
  const response = await getUserExercises(userId)
  if (response.isSuccess) {
    const userActivities = response.data.sort((a, b) => new Date(b.date) - new Date(a.date))
    return userActivities.length ? userActivities[0] : { name: 'No recent activity', caloriesBurned: 0 }
  } else {
    console.error(`Error fetching exercises for user ${userId}:`, response.message)
    return { name: 'No recent activity', caloriesBurned: 0 }
  }
}

async function getLastMeal(userId) {
  console.log(`Fetching last meal for userId: ${userId}`); // Debug log
  const response = await getUserMeals(userId);
  if (response.isSuccess) {
    console.log(`API response for userId ${userId}:`, response.data);
    const userMeals = response.data
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    console.log(`Sorted meals for userId ${userId}:`, userMeals);
    return userMeals.length
      ? userMeals[0]
      : { name: "No meal recorded", mealCalories: 0 };
  } else {
    console.error(`Error fetching last meal for userId ${userId}:`, response.message);
    return { name: "No meal recorded", mealCalories: 0 };
  }
}

onMounted(async () => {
  if (currentUser) {
    if (currentUser.user.role === 'user') {
      const userResponse = await getUsers()
      if (userResponse.isSuccess) {
        const friends = userResponse.data.filter(user => currentUser.user.friends.includes(user.id))
        friendsActivities.value = await Promise.all(
          friends.map(async friend => {
            const recentActivity = await getMostRecentActivity(friend.id)
            const lastMeal = await getLastMeal(friend.id)
            console.log(`Friend activity for ${friend.name}:`, {
              recentActivity,
              lastMeal,
            });
            return {
              id: friend.id,
              name: friend.name,
              image: friend.image,
              exercise: recentActivity.name,
              caloriesBurned: recentActivity.caloriesBurned,
              lastMeal: lastMeal.name,
              mealCalories: lastMeal.mealCalories,
            }
          })
        )
        console.log("Final friendsActivities array:", friendsActivities.value);
      }
    }

    if (currentUser.user.role === 'admin') {
      const userResponse = await getUsers()
      if (userResponse.isSuccess) {
        friendsActivities.value = await Promise.all(
          userResponse.data.map(async user => {
            const recentActivity = await getMostRecentActivity(user.id)
            const lastMeal = await getLastMeal(user.id)
            return {
              id: user.id,
              name: user.name,
              image: user.image,
              exercise: recentActivity.name,
              caloriesBurned: recentActivity.caloriesBurned,
              lastMeal: lastMeal.name,
              mealCalories: lastMeal.calories
            }
          })
        )
      }
    }
  }
})
</script>

<template>
  <section class="section">
    <div class="container">
      <h1 class="title">Social</h1>
      <div v-if="currentUser && currentUser.user">
        <FriendActivityCard v-for="friend in friendsActivities" :key="friend.id" :friend="friend" />
      </div>
      <div v-else>
        <p class="notification is-danger">Please log in to view social activities.</p>
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
