<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { ref } from 'vue';
import FriendActivityCard from '@/components/FriendActivityCard.vue';

// Mock friends data
const friends = ref([
  { id: 1, name: 'Alice', exercise: 'Running', calories: 200 },
  { id: 2, name: 'Bob', exercise: 'Cycling', calories: 300 },
]);
</script>

<template>
    <section class="section">
      <div class="container">
        <h1 class="title">Social</h1>
        <FriendActivityCard
          v-for="friend in friends"
          :key="friend.id"
          :friend="friend"
        />
      </div>
    </section>
  </template>

<style scoped>
.section {
  padding-top: 2rem;
}
</style>
