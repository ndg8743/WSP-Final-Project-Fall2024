<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { getLogin } from '@/models/login'; // Import login functions

const loginIdentifier = ref('');
const password = ref('');
const loginError = ref('');
const { login, isLoggedIn } = getLogin();
const router = useRouter();

const handleLogin = async () => {
  try {
    // Attempt login using the identifier and password
    await login(loginIdentifier.value, password.value);
    router.push('/dashboard'); // Redirect to dashboard on success
  } catch (error) {
    if (error instanceof Error) {
      loginError.value = error.message;
    } else {
      loginError.value = String(error);
    }
  }
};
</script>

<template>
  <section class="section">
    <div class="container">
      <h1 class="title">Login</h1>
      <p v-if="loginError" class="error">{{ loginError }}</p>
      <div v-if="!isLoggedIn">
        <div class="field">
          <label class="label">Email or Username</label>
          <input
            class="input"
            type="text"
            placeholder="Enter your email or username"
            v-model="loginIdentifier"
          />
        </div>
        <div class="field">
          <label class="label">Password</label>
          <input
            class="input"
            type="password"
            placeholder="Enter your password"
            v-model="password"
          />
        </div>
        <button class="button is-primary" @click="handleLogin">Login</button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.error {
  color: red;
}
</style>
