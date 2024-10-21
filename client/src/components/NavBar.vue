<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink } from 'vue-router';

const isOpen = ref(false);
</script>

<template>
  <nav class="navbar is-info" role="navigation" aria-label="main navigation">
    <div class="container">
      <div class="navbar-brand">

        <RouterLink to="/">
          <img alt="App logo" class="logo" src="@/assets/logo.svg" width="30" height="30" />
        </RouterLink>

        <a role="button" class="navbar-burger" aria-label="menu" aria-expanded="false"
           :class="{ 'is-active': isOpen }" @click="isOpen = !isOpen">
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </a>
      </div>

      <div class="navbar-menu" :class="{ 'is-active': isOpen }">
        <div class="navbar-start">
          <RouterLink to="/dashboard" class="navbar-item">Dashboard</RouterLink>
          <RouterLink to="/exercises" class="navbar-item">Exercises</RouterLink>
          <RouterLink to="/social" class="navbar-item">Social</RouterLink>
          <RouterLink to="/meallog" class="navbar-item">Meal Log</RouterLink>
          <RouterLink to="/statistics" class="navbar-item">Statistics</RouterLink>

   
          <div class="navbar-item has-dropdown is-hoverable">
            <a class="navbar-link">
              More
            </a>
            <div class="navbar-dropdown">
              <RouterLink to="/profile" class="navbar-item">
                Profile
              </RouterLink>
              <RouterLink to="/contact" class="navbar-item">
                Contact
              </RouterLink>
              <hr class="navbar-divider">
              <RouterLink to="/admin" class="navbar-item">
                Admin
              </RouterLink>
            </div>
          </div>
        </div>

        <div class="navbar-end">
          <div class="navbar-item">
            <div class="buttons">
              <RouterLink to="/signup" class="button is-primary">
                <strong>Sign up</strong>
              </RouterLink>
              <RouterLink to="/login" class="button is-light">
                Log in
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.router-link-active {
  font-weight: bold;
  border-bottom: 2px solid blue;
}
.navbar-burger {
  cursor: pointer;
}

.logo {
  margin-right: 10px;
  margin-bottom: -20px;
  padding: 1px;
}
</style>