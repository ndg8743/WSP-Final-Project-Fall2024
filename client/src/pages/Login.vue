<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { ref } from 'vue';
import usersData from '@/data/users.json';
import { useRouter } from 'vue-router';

const loginIdentifier = ref('');
const password = ref('');
const loginError = ref('');
const router = useRouter();

const login = () => {
  const user = usersData.find(
    u => (u.email === loginIdentifier.value || u.name === loginIdentifier.value) && u.password === password.value
  );
  if (user) {
    localStorage.setItem('loggedInUser', JSON.stringify(user));
    router.push('/dashboard');
  } else {
    loginError.value = 'Invalid email, username, or password';
  }
};
</script>

<template>
  <section class="section">
    <div class="container">
      <h1 class="title">Login</h1>
      <p v-if="loginError" class="error">{{ loginError }}</p>
      <div class="field">
        <label class="label">Email or Username</label>
        <input class="input" type="text" placeholder="Enter your email or username" v-model="loginIdentifier" />
      </div>
      <div class="field">
        <label class="label">Password</label>
        <input class="input" type="password" placeholder="Enter your password" v-model="password" />
      </div>
      <button class="button is-primary" @click="login">Login</button>
    </div>
  </section>
</template>

<style scoped>
.error {
  color: red;
}
</style>
