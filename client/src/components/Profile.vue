<template>
  <div class="container">
    <h1 class="title">Profile Management</h1>
    <form @submit.prevent="updateProfile">
      <div class="field">
        <label class="label">Name</label>
        <div class="control">
          <input class="input" type="text" v-model="name" placeholder="Enter your name" />
        </div>
      </div>

      <div class="field">
        <label class="label">Weight (kg)</label>
        <div class="control">
          <input class="input" type="number" v-model="weight" placeholder="Enter your weight" />
        </div>
      </div>

      <div class="field">
        <label class="label">Fitness Goal</label>
        <div class="control">
          <textarea class="textarea" v-model="goal" placeholder="Describe your fitness goal"></textarea>
        </div>
      </div>

      <div class="control">
        <button class="button is-primary" type="submit">Update Profile</button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const name = ref<string>('');
const weight = ref<string>('');
const goal = ref<string>('');

function updateProfile() {
  // Logic for updating profile (possibly send data to the server)
  console.log('Profile updated:', { name: name.value, weight: weight.value, goal: goal.value });
}
</script>

<style scoped>
.container {
  max-width: 600px;
  margin: 0 auto;
}
</style>