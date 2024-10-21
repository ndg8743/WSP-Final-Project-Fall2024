<template>
    <section class="section">
      <div class="container">
        <h1 class="title">Welcome to the Fitness Tracker App</h1>
        <p class="subtitle">Track your exercises, monitor your progress, and stay connected with friends!</p>
  
        <div class="buttons">
          <RouterLink to="/dashboard" class="button is-primary">Go to Dashboard</RouterLink>
          <RouterLink to="/login" class="button is-light">Log in</RouterLink>
        </div>
      </div>
    </section>
  </template>
  
  <script setup>
//logic?
  </script>
  
  <style scoped>
  .container {
    text-align: center;
  }
  .buttons {
    margin-top: 20px;
  }
  </style>
  