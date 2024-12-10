<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import { getLogin } from '@/models/login';

const isOpen = ref(false);
const { isLoggedIn, logout } = getLogin();
</script>

<template>
  <nav class="navbar is-info" role="navigation" aria-label="main navigation">
    <div class="container">
      <div class="navbar-brand">
        <RouterLink to="/">
          <img alt="App logo" class="logo" src="@/assets/logo.svg" width="30" height="30" />
        </RouterLink>

        <a role="button" class="navbar-burger" aria-label="menu" aria-expanded="false" :class="{ 'is-active': isOpen }"
          @click="isOpen = !isOpen">
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </a>
      </div>

      <div class="navbar-menu" :class="{ 'is-active': isOpen }">
        <div class="navbar-start">
          <RouterLink to="/dashboard" class="navbar-item">
            <span class="icon"><i class="fas fa-tachometer-alt"></i></span>
            Dashboard
          </RouterLink>
          <RouterLink to="/exercises" class="navbar-item">
            <span class="icon"><i class="fas fa-dumbbell"></i></span>
            Exercises
          </RouterLink>
          <RouterLink to="/meallog" class="navbar-item">
            <span class="icon"><i class="fas fa-utensils"></i></span>
            Meals
          </RouterLink>
          <RouterLink to="/social" class="navbar-item">
            <span class="icon"><i class="fas fa-users"></i></span>
            Social
          </RouterLink>
          <RouterLink to="/search" class="navbar-item">
            <span class="icon"><i class="fas fa-search"></i></span>
            Search
          </RouterLink>
          <RouterLink to="/statistics" class="navbar-item">
            <span class="icon"><i class="fas fa-chart-line"></i></span>
            Statistics
          </RouterLink>

          <div class="navbar-item has-dropdown is-hoverable">
            <a class="navbar-link">
              <span class="icon"><i class="fas fa-ellipsis-h"></i></span>
              More
            </a>
            <div class="navbar-dropdown">
              <RouterLink to="/profile" class="navbar-item">
                <span class="icon"><i class="fas fa-user"></i></span>
                Profile
              </RouterLink>
              <RouterLink to="/contact" class="navbar-item">
                <span class="icon"><i class="fas fa-envelope"></i></span>
                Contact
              </RouterLink>
              <hr class="navbar-divider">
              <RouterLink to="/admin" class="navbar-item">
                <span class="icon"><i class="fas fa-cog"></i></span>
                Admin
              </RouterLink>
            </div>
          </div>
        </div>

        <div class="navbar-end">
          <div class="navbar-item">
            <div class="buttons">
              <RouterLink v-if="!isLoggedIn" to="/signup" class="button is-primary">
                <span class="icon"><i class="fas fa-user-plus"></i></span>
                <strong>Sign up</strong>
              </RouterLink>
              <RouterLink v-if="!isLoggedIn" to="/login" class="button is-light">
                <span class="icon"><i class="fas fa-sign-in-alt"></i></span>
                Log in
              </RouterLink>
              <button v-if="isLoggedIn" class="button is-danger" @click="logout">
                <span class="icon"><i class="fas fa-sign-out-alt"></i></span>
                Logout
              </button>
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

  margin-bottom: -35px;
  padding: 5px;
  width: 40px;
}

/* Add specific margin for icons within buttons */
.buttons .icon i {
  margin-right: 30px;
  /* Space between icon and text */

}

/* Increase button size */
.buttons .button {
  font-size: 1.1rem;
  /* Adjust font size */
  padding: 0.75rem 1.5rem;
  /* Increase padding */
  margin-right: 10px;
  /* Add margin between buttons */
  width: 150px;
}
</style>
