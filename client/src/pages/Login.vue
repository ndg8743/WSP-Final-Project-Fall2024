<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { getLogin } from '@/models/login'
import { api } from '@/models/myFetch'

const loginIdentifier = ref('')
const password = ref('')
const loginError = ref('')
const isLoggedIn = ref(false)
const router = useRouter()
const { login, logout } = getLogin()

onMounted(() => {
  const session = localStorage.getItem('session')
  isLoggedIn.value = !!session
})

const handleLogin = async () => {
  const response = await api('users/login', { email: loginIdentifier.value, password: password.value }, 'POST')

  if (response.isSuccess) {
    localStorage.setItem('session', JSON.stringify(response.data))
    login(response.data) // Pass the user object
    isLoggedIn.value = true
    router.push('/dashboard')
  } else {
    loginError.value = response.message
  }
}

const handleLogout = () => {
  logout()
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
