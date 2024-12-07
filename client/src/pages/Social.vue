<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { ref, onMounted } from 'vue'
import FriendActivityCard from '@/components/FriendActivityCard.vue'
import { api } from '@/models/myFetch'

// Retrieve current user from session token
const session = localStorage.getItem('session')
const currentUser = session ? JSON.parse(session) : null

// Store the data to display in the UI
const friendsActivities = ref([])

// Helper functions to get recent activity and last meal for a given user
async function getMostRecentActivity(userId) {
  const userActivities = await api('exercises', { userId })
  userActivities.sort((a, b) => new Date(b.date) - new Date(a.date))
  return userActivities.length ? userActivities[0] : { name: 'No recent activity', caloriesBurned: 0 }
}

async function getLastMeal(userId) {
  const userMeals = await api('meals', { userId })
  userMeals.sort((a, b) => new Date(b.date) - new Date(a.date))
  return userMeals.length ? userMeals[0] : { name: 'No meal recorded', calories: 0 }
}

onMounted(async () => {
  if (currentUser) {
    const friends = currentUser.role === 'admin' ? await api('users') : currentUser.friends.map(id => ({ id }))
    friendsActivities.value = await Promise.all(friends.map(async friend => {
      const recentActivity = await getMostRecentActivity(friend.id)
      const lastMeal = await getLastMeal(friend.id)
      return {
        id: friend.id,
        name: friend.name,
        image: friend.image,
        exercise: recentActivity.name,
        caloriesBurned: recentActivity.caloriesBurned,
        lastMeal: lastMeal.name,
        mealCalories: lastMeal.calories
      }
    }))
  }
})
</script>

<template>
  <section class="section">
    <div class="container">
      <h1 class="title">Social</h1>
      <div v-if="currentUser">
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
