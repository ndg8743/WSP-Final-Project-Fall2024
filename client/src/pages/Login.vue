<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getLogin } from '../models/login.js';

const router = useRouter();
const loginIdentifier = ref('');
const password = ref('');
const loginError = ref('');
const isLoading = ref(false);
const { login, isLoggedIn, session, logout } = getLogin();

// Check if user is already logged in
onMounted(() => {
  if (session.token && session.user) {
    router.push('/dashboard');
  }
});

const handleLogin = async () => {
  if (!loginIdentifier.value || !password.value) {
    loginError.value = 'Please enter both username/email and password';
    return;
  }

  try {
    isLoading.value = true;
    loginError.value = ''; // Clear any previous errors
    await login(loginIdentifier.value, password.value);
    // Navigation is handled in login.ts
  } catch (error) {
    console.error('Login error:', error);
    loginError.value = error instanceof Error ? error.message : 'Login failed';
  } finally {
    isLoading.value = false;
  }
};

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !isLoading.value) {
    handleLogin();
  }
};

const handleLogout = () => {
  isLoading.value = true;
  try {
    logout();
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <section class="section">
    <div class="container">
      <h1 class="title">Login</h1>
      <div v-if="loginError" class="notification is-danger">
        {{ loginError }}
      </div>
      <div v-if="!isLoggedIn">
        <div class="field">
          <label class="label">Email or Username</label>
          <div class="control">
            <input
              class="input"
              type="text"
              placeholder="Enter your email or username"
              v-model="loginIdentifier"
              @keydown="handleKeydown"
              :disabled="isLoading"
            />
          </div>
        </div>
        <div class="field">
          <label class="label">Password</label>
          <div class="control">
            <input
              class="input"
              type="password"
              placeholder="Enter your password"
              v-model="password"
              @keydown="handleKeydown"
              :disabled="isLoading"
            />
          </div>
        </div>
        <div class="field">
          <div class="control">
            <button 
              class="button is-primary"
              :class="{ 'is-loading': isLoading }"
              @click="handleLogin"
              :disabled="isLoading || !loginIdentifier || !password"
            >
              Login
            </button>
          </div>
        </div>
        <div class="field mt-4">
          <p>
            Don't have an account? 
            <router-link to="/signup" :class="{ 'is-disabled': isLoading }">Sign up</router-link>
          </p>
        </div>
      </div>
      <div v-else>
        <p>You are already logged in.</p>
        <div class="buttons">
          <router-link to="/dashboard" class="button is-primary">Go to Dashboard</router-link>
          <button 
            class="button is-danger" 
            @click="handleLogout"
            :class="{ 'is-loading': isLoading }"
            :disabled="isLoading"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.section {
  padding-top: 2rem;
}

.field {
  max-width: 400px;
  margin: 0 auto;
}

.notification {
  max-width: 400px;
  margin: 1rem auto;
}

.mt-4 {
  margin-top: 1rem;
}

.is-disabled {
  pointer-events: none;
  opacity: 0.6;
}

.buttons {
  max-width: 400px;
  margin: 1rem auto;
  display: flex;
  gap: 1rem;
  justify-content: center;
}
</style>
