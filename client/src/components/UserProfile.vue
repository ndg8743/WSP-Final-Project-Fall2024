<script setup lang="ts">
import type { User } from '@/models/user.js';

defineProps<{
  user: User
}>();
</script>

<template>
  <div class="box">
    <div class="box-content">
      <h3>{{ user.name }}</h3>
      <p>Email: {{ user.email }}</p>
      <p>Role: {{ user.role }}</p>
      <h4>Friends:</h4>
      <ul>
        <li v-for="friend in user.friends" :key="friend">
          Friend ID: {{ friend }}
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
h3 {
  font-weight: bold;
}
.box-content {
  padding: 10px;
}
ul {
  list-style-type: none;
  padding: 0;
}
</style>
