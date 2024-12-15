<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { defineProps } from 'vue';
// @ts-ignore
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
    <div class="activity-info">
      <p><strong>Activity:</strong> {{ friend.exercise || 'No recent activity' }}</p>
      <p><strong>Calories Burned:</strong> {{ friend.caloriesBurned || 0 }} cal</p>
      <p><strong>Last Meal:</strong> {{ friend.lastMeal || 'No meal recorded' }}</p>
      <p><strong>Calories from Last Meal:</strong> {{ friend.mealCalories || 0 }} cal</p>
    </div>
  </div>
</template>

<style scoped>
.box {
  min-width: 300px;
  margin: 1rem;
  padding: 1.5rem;
}

.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.user-image {
  width: 80px;
  height: 80px;
  min-width: 80px;
  margin-right: 1rem;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #f5f5f5;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.user-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.subtitle {
  margin: 0;
  flex: 1;
  min-width: 0;
  word-wrap: break-word;
}

.activity-info {
  margin-left: 0.5rem;
}

.activity-info p {
  margin: 0.5rem 0;
}
</style>
