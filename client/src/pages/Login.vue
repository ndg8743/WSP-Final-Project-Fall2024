<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import usersData from '@/data/users.json'
import { useRouter, RouterLink } from 'vue-router'
import { getLogin } from '@/models/login' // Import getLogin

const loginIdentifier = ref('')
const password = ref('')
const loginError = ref('')
const isLoggedIn = ref(false) // Track login state
const router = useRouter()
const { login, logout } = getLogin() // Destructure login and logout from getLogin

// Check if the user is already logged in
onMounted(() => {
  const session = localStorage.getItem('session')
  isLoggedIn.value = !!session
})

const handleLogin = () => {
  const normalizedLoginIdentifier = loginIdentifier.value.toLowerCase()
  const normalizedPassword = password.value // Password typically remains case-sensitive

  const user = usersData.find(
    u =>
      (u.email.toLowerCase() === normalizedLoginIdentifier || u.name.toLowerCase() === normalizedLoginIdentifier) &&
      u.password === normalizedPassword
  )
  
  if (user) {
    localStorage.setItem('session', JSON.stringify(user)) // Store user in session
    login() // Call login to update auth state
    isLoggedIn.value = true // Update login state
    router.push('/dashboard')
  } else {
    loginError.value = 'Invalid email, username, or password'
  }
}

const handleLogout = () => {
  logout() // Call logout to clear session and auth state
  isLoggedIn.value = false
}
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
      <div v-else>
        <p>You are already logged in.</p>
        <RouterLink to="/" class="button is-danger" @click="handleLogout">Logout</RouterLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.error {
  color: red;
}
</style>
