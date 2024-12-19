<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { defineProps, computed, ref, onMounted } from 'vue'
import { getUserById } from '../models/users'

interface Friend {
  id: number
  name: string
  image: string | null
  exercise: string
  caloriesBurned: number
  lastMeal: string
  mealCalories: number
  exerciseTaggedFriends?: number[]
  mealTaggedFriends?: number[]
}

interface Props {
  /** Friend's activity data */
  friend: Friend
}

const props = defineProps<Props>()

// Ensure image is always a string
const imageUrl = computed(() => props.friend.image || '/src/assets/User.jpg')

const exerciseTaggedNames = ref<string[]>([])
const mealTaggedNames = ref<string[]>([])

onMounted(async () => {
  // Get names for exercise tagged friends
  if (props.friend.exerciseTaggedFriends?.length) {
    const names = await Promise.all(
      props.friend.exerciseTaggedFriends.map(async (id) => {
        const response = await getUserById(id)
        return response.isSuccess ? response.data.name : 'Unknown'
      })
    )
    exerciseTaggedNames.value = names
  }

  // Get names for meal tagged friends
  if (props.friend.mealTaggedFriends?.length) {
    const names = await Promise.all(
      props.friend.mealTaggedFriends.map(async (id) => {
        const response = await getUserById(id)
        return response.isSuccess ? response.data.name : 'Unknown'
      })
    )
    mealTaggedNames.value = names
  }
})
</script>

<template>
  <div 
    class="box friend-activity-card has-background-dark has-text-light"
    role="listitem"
  >
    <div class="user-info">
      <div 
        class="user-image"
        role="img"
        :aria-label="`${friend.name}'s profile picture`"
      >
        <img 
          :src="imageUrl" 
          :alt="`${friend.name}'s profile picture`" 
        />
      </div>
      <h2 class="subtitle has-text-light">{{ friend.name }}'s Recent Activity</h2>
    </div>
    <div class="activity-info">
      <div class="activity-section">
        <p>
          <strong>Activity:</strong> 
          {{ friend.exercise || 'No recent activity' }}
        </p>
        <p>
          <strong>Calories Burned:</strong> 
          {{ friend.caloriesBurned.toLocaleString() }} cal
        </p>
        <!-- Exercise Tagged Friends -->
        <div v-if="exerciseTaggedNames.length" class="tagged-friends">
          <p><strong>Tagged in Exercise:</strong></p>
          <div class="tags">
            <span 
              v-for="name in exerciseTaggedNames" 
              :key="name" 
              class="tag is-info is-light"
            >
              {{ name }}
            </span>
          </div>
        </div>
      </div>

      <div class="activity-section">
        <p>
          <strong>Last Meal:</strong> 
          {{ friend.lastMeal || 'No meal recorded' }}
        </p>
        <p>
          <strong>Calories from Last Meal:</strong> 
          {{ friend.mealCalories.toLocaleString() }} cal
        </p>
        <!-- Meal Tagged Friends -->
        <div v-if="mealTaggedNames.length" class="tagged-friends">
          <p><strong>Tagged in Meal:</strong></p>
          <div class="tags">
            <span 
              v-for="name in mealTaggedNames" 
              :key="name" 
              class="tag is-info is-light"
            >
              {{ name }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.user-image img {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
}

.activity-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-section {
  padding: 0.75rem;
  border-radius: 4px;
  background-color: #363636;
  border: 1px solid #4a4a4a;
}

.tagged-friends {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #4a4a4a;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}
</style>
