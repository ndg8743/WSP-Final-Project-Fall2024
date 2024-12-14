<script setup>
import { defineProps } from 'vue';
import defaultUserImage from '@/assets/User.jpg'; // Import default image

const props = defineProps({
  friend: {
    type: Object,
    required: true,
  },
});
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
.box {
  margin-bottom: 15px;
  transition: all 0.3s ease;
}

.box:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

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
