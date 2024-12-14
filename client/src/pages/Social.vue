<script setup lang="ts">
import { ref, onMounted } from 'vue'
// @ts-ignore
import FriendActivityCard from '../components/FriendActivityCard.vue'
import { getUserExercises } from '../models/exercises.js'
import { getUsers, getUserById, type UserResponse } from '../models/users.js'
import { getUserMeals } from '../models/meals.js'
import { getSession } from '../models/login.js'

interface FriendActivity {
  id: number
  name: string
  image: string | null
  exercise: string
  caloriesBurned: number
  lastMeal: string
  mealCalories: number
}

const session = getSession()
const friendsActivities = ref<FriendActivity[]>([])
const error = ref<string | null>(null)
const isLoading = ref(true)

async function getMostRecentActivity(userId: number) {
  try {
    const response = await getUserExercises(userId)
    if (!response?.isSuccess) {
      console.error(`Error fetching exercises for user ${userId}:`, response?.message)
      return { name: 'No recent activity', caloriesBurned: 0 }
    }

    const userActivities = response.data.sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    return userActivities.length > 0
      ? userActivities[0]
      : { name: 'No recent activity', caloriesBurned: 0 }
  } catch (err) {
    console.error(`Failed to get activities for user ${userId}:`, err)
    return { name: 'No recent activity', caloriesBurned: 0 }
  }
}

async function getLastMeal(userId: number) {
  try {
    const response = await getUserMeals(userId)
    if (!response?.isSuccess) {
      console.error(`Error fetching meals for user ${userId}:`, response?.message)
      return { name: 'No meal recorded', mealCalories: 0 }
    }

    const userMeals = response.data.sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    return userMeals.length > 0
      ? userMeals[0]
      : { name: 'No meal recorded', mealCalories: 0 }
  } catch (err) {
    console.error(`Failed to get meals for user ${userId}:`, err)
    return { name: 'No meal recorded', mealCalories: 0 }
  }
}

async function loadFriendsActivities() {
  isLoading.value = true
  error.value = null

  try {
    if (!session?.user) {
      error.value = 'No active session found'
      return
    }

    let users: UserResponse[] = []

    if (session.user.role === 'admin') {
      const response = await getUsers()
      if (!response?.isSuccess) {
        throw new Error('Failed to fetch users')
      }
      users = response.data
    } else {
      const response = await getUserById(session.user.id)
      if (!response?.isSuccess) {
        throw new Error('Failed to fetch user data')
      }

      // If the user has friends, fetch each friend's data
      if (response.data.friends?.length) {
        const friendPromises = response.data.friends.map(friendId =>
          getUserById(friendId)
        )
        const friendResponses = await Promise.all(friendPromises)
        users = friendResponses
          .filter(response => response.isSuccess)
          .map(response => response.data)
      }
    }

    // Map and fetch activities for each user/friend
    friendsActivities.value = await Promise.all(
      users.map(async user => {
        const recentActivity = await getMostRecentActivity(user.id)
        const lastMeal = await getLastMeal(user.id)

        return {
          id: user.id,
          name: user.name,
          image: user.image || '/src/assets/User.jpg', // Default image if none provided
          exercise: recentActivity.name,
          caloriesBurned: recentActivity.caloriesBurned,
          lastMeal: lastMeal.name,
          mealCalories: lastMeal.mealCalories,
        }
      })
    )
  } catch (err) {
    console.error('Error loading friend activities:', err)
    error.value = 'Failed to load social activities'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadFriendsActivities()
})
</script>

<template>
  <section class="section">
    <div class="container">
      <h1 class="title">Social</h1>

      <div v-if="error" class="notification is-danger">
        {{ error }}
      </div>

      <div v-else-if="!session?.user" class="notification is-warning">
        Please log in to view social activities.
      </div>

      <div v-else-if="isLoading" class="notification is-info">
        Loading activities...
      </div>

      <div v-else-if="friendsActivities.length === 0" class="notification is-info">
        No friend activities found.
      </div>

      <div v-else class="friends-grid">
        <FriendActivityCard v-for="friend in friendsActivities" :key="friend.id" :friend="friend" />
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

.friends-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}
</style>
