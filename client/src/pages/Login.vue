<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getLogin } from '@/models/login';
import { api } from '@/models/myFetch';

// State for login
const loginIdentifier = ref('');
const password = ref('');
const loginError = ref('');
const isLoggedIn = ref(false);

// Router for navigation
const router = useRouter();

// Import login/logout functions
const { login, logout } = getLogin();

// Check if the user is already logged in
onMounted(() => {
  console.log('Checking login status');
  const session = localStorage.getItem('session');
  isLoggedIn.value = !!session;
  if (isLoggedIn.value) {
    console.log('User is already logged in');
  }
});

// Handle the login process
const handleLogin = async () => {
  console.log('Attempting login with identifier:', loginIdentifier.value);
  if (!loginIdentifier.value || !password.value) {
    loginError.value = 'Please enter both username/email and password.';
    return;
  }

  try {
    const response = await api('users/login', { identifier: loginIdentifier.value, password: password.value }, 'POST') as any;
    if (response.isSuccess) {
      localStorage.setItem('session', JSON.stringify(response.data));
      login(response.data);
      isLoggedIn.value = true;
      console.log('Login successful:', response.data);
      if (response.data.user.role === 'admin') {
        router.push('/admin/users');
      } else {
        router.push('/dashboard');
      }
    } else {
      loginError.value = response.message || 'Invalid username or password.';
      console.log('Login failed:', loginError.value);
    }
  } catch (error) {
    console.error('Error during login:', error);
    loginError.value = 'An unexpected error occurred. Please try again later.';
  }
};

// Handle the logout process
const handleLogout = () => {
  console.log('Logging out');
  logout();
  isLoggedIn.value = false;
  router.push('/'); // Redirect to home page after logout
  console.log('Logout successful');
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
          <input class="input" type="text" placeholder="Enter your email or username" v-model="loginIdentifier" />
        </div>
        <div class="field">
          <label class="label">Password</label>
          <input class="input" type="password" placeholder="Enter your password" v-model="password" />
        </div>
        <button class="button is-primary" @click="handleLogin">Login</button>
      </div>
      <div v-else>
        <p>You are already logged in.</p>
        <button class="button is-danger" @click="handleLogout">Logout</button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.error {
  color: red;
}
</style>
