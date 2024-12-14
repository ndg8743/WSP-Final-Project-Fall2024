<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { defineProps } from 'vue';
import defaultUserImage from '../assets/User.jpg';

interface Friend {
  id: number;
  name: string;
  image: string | null;
  exercise: string;
  caloriesBurned: number;
  lastMeal: string;
  mealCalories: number;
}

const props = defineProps<{
  friend: Friend;
}>();
</script>

<template>
  <div class="box">
    <div class="user-info">
      <!-- Display user's image if available, otherwise show default User.jpg -->
      <div class="user-image">
        <img :src="friend.image || defaultUserImage" alt="User image" />
      </div>
      <h2 class="subtitle">{{ friend.name }}'s Recent Activity</h2>
    </div>
    <p><strong>Activity:</strong> {{ friend.exercise || 'No recent activity' }}</p>
    <p><strong>Calories Burned:</strong> {{ friend.caloriesBurned || 0 }} cal</p>
    <p><strong>Last Meal:</strong> {{ friend.lastMeal || 'No meal recorded' }}</p>
    <p><strong>Calories from Last Meal:</strong> {{ friend.mealCalories || 0 }} cal</p>
  </div>
</template>

<style scoped>
.user-info {
  display: flex;
  align-items: center;
}

.user-image {
  width: 50px;
  height: 50px;
  margin-right: 15px;
}

.user-image img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}
</style>
