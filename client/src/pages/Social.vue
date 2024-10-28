<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { ref, onMounted } from 'vue'
import FriendActivityCard from '@/components/FriendActivityCard.vue'
import usersData from '@/data/users.json'
import exercisesData from '@/data/exercises.json'
import mealsData from '@/data/meals.json'

// Retrieve current user from session token
const session = localStorage.getItem('session')
const currentUser = session ? JSON.parse(session) : null

// Store the data to display in the UI
const friendsActivities = ref([])

// Helper functions to get recent activity and last meal for a given user
function getMostRecentActivity(userId) {
  const userActivities = exercisesData.exercises
    .filter(activity => activity.userId === userId)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
  return userActivities.length ? userActivities[0] : { name: 'No recent activity', caloriesBurned: 0 }
}

function getLastMeal(userId) {
  const userMeals = mealsData
    .filter(meal => meal.userId === userId)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
  return userMeals.length ? userMeals[0] : { name: 'No meal recorded', calories: 0 }
}

onMounted(() => {
  if (currentUser) {
    // Display only friends' activities for regular users
    if (currentUser.role === 'user') {
      friendsActivities.value = currentUser.friends.map(friendId => {
        const friend = usersData.find(user => user.id === friendId)
        const recentActivity = getMostRecentActivity(friendId)
        const lastMeal = getLastMeal(friendId)

        return {
          id: friend.id,
          name: friend.name,
          image: friend.image,
          exercise: recentActivity.name,
          caloriesBurned: recentActivity.caloriesBurned,
          lastMeal: lastMeal.name,
          mealCalories: lastMeal.calories
        }
      })
    }

    // Display all users for admin
    if (currentUser.role === 'admin') {
      friendsActivities.value = usersData.map(user => {
        const recentActivity = getMostRecentActivity(user.id)
        const lastMeal = getLastMeal(user.id)

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
    }
  }
})
</script>

<template>
  <section class="section">
    <div class="container">
      <h1 class="title">Social</h1>
      <div v-if="currentUser">
        <FriendActivityCard
          v-for="friend in friendsActivities"
          :key="friend.id"
          :friend="friend"
        />
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
