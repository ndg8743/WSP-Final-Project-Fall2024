<!-- eslint-disable vue/multi-word-component-names -->
 <script setup>
import { ref } from 'vue';

// Mock data for dashboard stats
const totalUsers = ref(50);
const lastSettingsUpdate = ref('2024-10-19');
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
          <p><strong>Settings Updated:</strong> {{ lastSettingsUpdate }}</p>
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
  