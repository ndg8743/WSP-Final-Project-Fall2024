<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { ref, computed } from 'vue';
import usersData from '@/data/users.json';

const searchQuery = ref('');
const filteredUsers = computed(() => {
  return usersData.filter(user => user.name.toLowerCase().includes(searchQuery.value.toLowerCase()));
});
</script>

<template>
  <section class="section">
    <div class="container">
      <h1 class="title">Search Users</h1>
      <div class="field">
        <input class="input" type="text" placeholder="Search by name" v-model="searchQuery" />
      </div>
      <ul>
        <li v-for="user in filteredUsers" :key="user.id">
          {{ user.name }} - {{ user.email }}
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.section {
  padding-top: 2rem;
}
</style>
