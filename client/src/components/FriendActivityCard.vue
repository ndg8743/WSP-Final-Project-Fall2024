<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { defineProps, computed } from 'vue'

interface Friend {
  id: number
  name: string
  image: string | null
  exercise: string
  caloriesBurned: number
  lastMeal: string
  mealCalories: number
}

interface Props {
  /** Friend's activity data */
  friend: Friend
}

const props = defineProps<Props>()

// Ensure image is always a string
const imageUrl = computed(() => props.friend.image || '/src/assets/User.jpg')
</script>

<template>
  <div 
    class="box friend-activity-card"
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
      <h2 class="subtitle">{{ friend.name }}'s Recent Activity</h2>
    </div>
    <div class="activity-info">
      <p>
        <strong>Activity:</strong> 
        {{ friend.exercise || 'No recent activity' }}
      </p>
      <p>
        <strong>Calories Burned:</strong> 
        {{ friend.caloriesBurned.toLocaleString() }} cal
      </p>
      <p>
        <strong>Last Meal:</strong> 
        {{ friend.lastMeal || 'No meal recorded' }}
      </p>
      <p>
        <strong>Calories from Last Meal:</strong> 
        {{ friend.mealCalories.toLocaleString() }} cal
      </p>
    </div>
  </div>
</template>
