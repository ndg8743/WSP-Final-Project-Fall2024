<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink } from 'vue-router';

const isOpen = ref(false);
</script>

<template>
  <nav class="navbar is-info" role="navigation" aria-label="main navigation">
    <div class="container">
      <div class="navbar-brand">
        <img alt="App logo" class="logo" src="@/assets/logo.svg" width="30" height="30" />

        <a role="button" class="navbar-burger" aria-label="menu" aria-expanded="false"
           :class="{ 'is-active': isOpen }" @click="isOpen = !isOpen">
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </a>
      </div>

      <div class="navbar-menu" :class="{ 'is-active': isOpen }">
        <div class="navbar-start">
          <RouterLink to="/" class="navbar-item">Home</RouterLink>
          <RouterLink to="/dashboard" class="navbar-item">Dashboard</RouterLink>
          <RouterLink to="/exercises" class="navbar-item">Exercises</RouterLink>
          <RouterLink to="/social" class="navbar-item">Friends' Activities</RouterLink>

          <!-- Dropdown for more links -->
          <div class="navbar-item has-dropdown is-hoverable">
            <a class="navbar-link">
              More
            </a>
            <div class="navbar-dropdown">
              <RouterLink to="/about" class="navbar-item">
                About
              </RouterLink>
              <RouterLink to="/contact" class="navbar-item">
                Contact
              </RouterLink>
              <hr class="navbar-divider">
              <a class="navbar-item">
                Report an issue
              </a>
            </div>
          </div>
        </div>

        <!-- Sign up / Log in buttons -->
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
</style>
