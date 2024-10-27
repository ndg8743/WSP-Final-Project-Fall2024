<script setup>
  import { defineProps } from 'vue';
  
  const props = defineProps({
    friend: {
      type: Object,
      required: true
    }
  });
  </script>

<template>
    <div class="box">
      <h2 class="subtitle">{{ friend.name }}'s Recent Activity</h2>
      <p>{{ friend.exercise }}</p>
      <p><strong>Calories Burned:</strong> {{ friend.calories }} kcal</p>
    </div>
  </template>
  
  <style scoped>
  .box {
    margin-bottom: 15px;
  }
  </style>
  