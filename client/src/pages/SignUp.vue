<script setup>
import { ref } from 'vue';
import usersData from '@/data/users.json';
import { useRouter } from 'vue-router';

const name = ref('');
const email = ref('');
const password = ref('');
const signupError = ref('');
const router = useRouter();

const signup = () => {
  const existingUser = usersData.find(u => u.email === email.value);
  if (existingUser) {
    signupError.value = 'Email already exists';
  } else {
    const newUser = { id: Date.now(), name: name.value, email: email.value, password: password.value, role: 'user', friends: [] };
    usersData.push(newUser);
    saveUsersToFile();
    localStorage.setItem('loggedInUser', JSON.stringify(newUser));
    router.push('/dashboard');
  }
};

// Function to save usersData to users.json (requires server-side)
function saveUsersToFile() {
  // Logic for writing to file or updating backend API
}
</script>

<template>
  <section class="section">
    <div class="container">
      <h1 class="title">Signup</h1>
      <p v-if="signupError" class="error">{{ signupError }}</p>
      <div class="field">
        <label class="label">Name</label>
        <input class="input" type="text" v-model="name" />
      </div>
      <div class="field">
        <label class="label">Email</label>
        <input class="input" type="email" v-model="email" />
      </div>
      <div class="field">
        <label class="label">Password</label>
        <input class="input" type="password" v-model="password" />
      </div>
      <button class="button is-primary" @click="signup">Signup</button>
    </div>
  </section>
</template>

<style scoped>
.error {
  color: red;
}
</style>
