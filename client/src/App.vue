<script setup lang="ts">
import ExerciseLog from './components/ExerciseLog.vue';
import Profile from './components/Profile.vue';
import Leaderboard from './components/Leaderboard.vue';
</script>

<template>
  <div class="container">
    <header>
      <a href="https://vitejs.dev" target="_blank">
        <img src="/vite.svg" class="logo" alt="Vite logo" />
      </a>
      <a href="https://vuejs.org/" target="_blank">
        <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
      </a>
    </header>
    <main>
      <section>
        <h2>Exercise Log</h2>
        <ExerciseLog />
      </section>
      <section>
        <h2>Profile Management</h2>
        <Profile />
      </section>
      <section>
        <h2>Leaderboard</h2>
        <Leaderboard />
      </section>
    </main>
  </div>
</template>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}
header {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
main {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
section {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>