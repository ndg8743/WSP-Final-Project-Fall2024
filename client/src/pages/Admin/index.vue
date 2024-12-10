<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { ref, onMounted } from 'vue';
import { getUsers } from '@/models/users';

const totalUsers = ref(0);
const lastLogin = ref('');

onMounted(async () => {
  const response = await getUsers();
  if (response.isSuccess) {
    totalUsers.value = response.total;
    lastLogin.value = new Date().toLocaleString();
  }
});
</script>

<template>
    <section class="section">
      <div class="container">
        <h1 class="title">Admin Dashboard</h1>
        <div class="box">
          <p>Welcome to the admin panel. Here you can manage users and modify app settings.</p>
          <div class="buttons">
            <router-link to="/admin/users" class="button is-link">Manage Users</router-link>
            <router-link to="/admin/settings" class="button is-link">App Settings</router-link>
          </div>
        </div>
  
        <!-- Statistics or Other Admin Info -->
        <div class="box">
          <h2 class="subtitle">Quick Statistics</h2>
          <p><strong>Total Users:</strong> {{ totalUsers }}</p>
          <p><strong>Last Login:</strong> {{ lastLogin }}</p>
        </div>
      </div>
    </section>
  </template>
  
  <style scoped>
  .section {
    padding-top: 2rem;
  }
  .buttons {
    margin-top: 15px;
  }
  </style>
