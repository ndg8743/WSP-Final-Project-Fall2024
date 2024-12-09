<script setup>
import { defineProps } from 'vue';
import defaultUserImage from '@/assets/User.jpg';

const props = defineProps({
  friend: {
    type: Object,
    required: true,
    default: () => ({
      name: "Unknown Friend",
      image: "/assets/User.jpg",
      exercise: "No recent activity",
      caloriesBurned: 0,
      lastMeal: "No meal recorded",
      mealCalories: 0,
    }),
  },
});

// Debugging prop values
console.log('FriendActivityCard props:', props);
</script>

<template>
  <div class="box" v-if="friend">
    <div class="user-info">
      <div class="user-image">
        <img :src="friend.image || defaultUserImage" alt="User image" />
      </div>
      <h2 class="subtitle">{{ friend.name }}'s Recent Activity</h2>
    </div>
    <p><strong>Activity:</strong> {{ friend.exercise }}</p>
    <p><strong>Calories Burned:</strong> {{ friend.caloriesBurned }} kcal</p>
    <p><strong>Last Meal:</strong> {{ friend.lastMeal }}</p>
    <p><strong>Calories from Last Meal:</strong> {{ friend.mealCalories }} kcal</p>
  </div>
</template>

<style scoped>
.box {
  margin-bottom: 15px;
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
