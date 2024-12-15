<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
// @ts-expect-error: Vue component typing
import FriendActivityCard from '../components/FriendActivityCard.vue'
import { getUserExercises } from '../models/exercises'
import { getUsers, getUserById, type UserResponse } from '../models/users'
import { getUserMeals } from '../models/meals'
import { getSession } from '../models/login'

// Constants
const DEFAULT_USER_IMAGE = '/src/assets/User.jpg'
const DEFAULT_ACTIVITY = { name: 'No recent activity', caloriesBurned: 0 }
const DEFAULT_MEAL = { name: 'No meal recorded', mealCalories: 0 }

// Types
interface FriendActivity {
  id: number
  name: string
  image: string | null
  exercise: string
  caloriesBurned: number
  lastMeal: string
  mealCalories: number
}

interface Activity {
  name: string
  caloriesBurned: number
}

interface Meal {
  name: string
  mealCalories: number
}

// State
const router = useRouter()
const session = getSession()
const friendsActivities = ref<FriendActivity[]>([])
const error = ref<string | null>(null)
const isLoading = ref(true)

// Validate session
if (!session?.token || !session?.user?.id) {
  router.push('/login')
}

// Helper Functions
async function getMostRecentActivity(userId: number): Promise<Activity> {
  try {
    const response = await getUserExercises(userId)
    if (!response?.isSuccess) {
      return DEFAULT_ACTIVITY
    }

    const userActivities = response.data.sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    return userActivities.length > 0
      ? { 
          name: userActivities[0].name, 
          caloriesBurned: userActivities[0].caloriesBurned 
        }
      : DEFAULT_ACTIVITY
  } catch {
    return DEFAULT_ACTIVITY
  }
}

async function getLastMeal(userId: number): Promise<Meal> {
  try {
    const response = await getUserMeals(userId)
    if (!response?.isSuccess) {
      return DEFAULT_MEAL
    }

    const userMeals = response.data.sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    return userMeals.length > 0
      ? { 
          name: userMeals[0].name, 
          mealCalories: userMeals[0].mealCalories 
        }
      : DEFAULT_MEAL
  } catch {
    return DEFAULT_MEAL
  }
}

async function fetchUsers(): Promise<UserResponse[]> {
  if (!session?.user) {
    throw new Error('No active session found')
  }

  if (session.user.role === 'admin') {
    const response = await getUsers()
    if (!response?.isSuccess) {
      throw new Error('Failed to fetch users')
    }
    return response.data
  }

  const response = await getUserById(session.user.id)
  if (!response?.isSuccess) {
    throw new Error('Failed to fetch user data')
  }

  if (!response.data.friends?.length) {
    return []
  }

  const friendPromises = response.data.friends.map(friendId =>
    getUserById(friendId)
  )
  const friendResponses = await Promise.all(friendPromises)
  return friendResponses
    .filter(response => response.isSuccess)
    .map(response => response.data)
}

async function loadFriendsActivities() {
  if (!session?.token || !session?.user?.id) {
    router.push('/login')
    return
  }

  isLoading.value = true
  error.value = null

  try {
    const users = await fetchUsers()

    // Map and fetch activities for each user/friend
    friendsActivities.value = await Promise.all(
      users.map(async user => {
        const [recentActivity, lastMeal] = await Promise.all([
          getMostRecentActivity(user.id),
          getLastMeal(user.id)
        ])

        return {
          id: user.id,
          name: user.name,
          image: user.image || DEFAULT_USER_IMAGE,
          exercise: recentActivity.name,
          caloriesBurned: recentActivity.caloriesBurned,
          lastMeal: lastMeal.name,
          mealCalories: lastMeal.mealCalories,
        }
      })
    )
  } catch (err) {
    error.value = err instanceof Error 
      ? err.message 
      : 'Failed to load social activities'
    
    if (err instanceof Error && err.message === 'Session expired') {
      router.push('/login')
    }
  } finally {
    isLoading.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadFriendsActivities()
})
</script>

<template>
  <section class="section">
    <div class="container">
      <h1 class="title">Social</h1>

      <div 
        v-if="error" 
        class="notification is-danger"
        role="alert"
      >
        {{ error }}
      </div>

      <div 
        v-else-if="!session?.user" 
        class="notification is-warning"
        role="alert"
      >
        Please log in to view social activities.
      </div>

      <div 
        v-else-if="isLoading" 
        class="notification is-info"
        role="status"
      >
        Loading activities...
      </div>

      <div 
        v-else-if="friendsActivities.length === 0" 
        class="notification is-info"
        role="status"
      >
        No friends found. Add some friends to see their activities!
      </div>

      <div 
        v-else 
        class="friends-grid"
        role="list"
        aria-label="Friends' activities"
      >
        <FriendActivityCard 
          v-for="friend in friendsActivities" 
          :key="friend.id" 
          :friend="friend"
        />
      </div>
    </div>
  </section>
</template>
