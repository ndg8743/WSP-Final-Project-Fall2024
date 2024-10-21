<template>
    <section class="section">
      <div class="container">
        <h1 class="title">Login</h1>
        <div class="field">
          <label class="label">Username</label>
          <div class="control">
            <input class="input" type="text" placeholder="Enter your username" v-model="username" />
          </div>
        </div>
        <div class="field">
          <label class="label">Password</label>
          <div class="control">
            <input class="input" type="password" placeholder="Enter your password" v-model="password" />
          </div>
        </div>
        <button class="button is-primary" @click="login">Login</button>
      </div>
    </section>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  const username = ref('');
  const password = ref('');
  
  const login = () => {
    console.log(`Username: ${username.value}, Password: ${password.value}`);
    // Add your logic for login 
  };
  </script>
  
  <style scoped>
  .section {
    padding-top: 2rem;
  }
  </style>
  