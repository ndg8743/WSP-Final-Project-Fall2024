<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import NavBar from './components/NavBar.vue';
import 'bulma/css/bulma.css'; 
import './assets/main.css';    

const applyDefaultTheme = () => {
  const savedTheme = localStorage.getItem('theme') || 'dark'
  document.documentElement.classList.add(savedTheme)
}

onMounted(() => {
  applyDefaultTheme() // Apply dark theme by default on first load
})

</script>


<template>
  <header>
    <NavBar />
  </header>

  <div class="container">
    <RouterView />
  </div>
</template>

<style scoped>
body {
  background-color: aliceblue;
}

.container {
  background-color: white;
  box-shadow: drop-shadow(0 0 10px rgba(0, 0, 0, 0.8));
  min-height: 100vh;
}
</style>
