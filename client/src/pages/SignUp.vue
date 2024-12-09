<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { getLogin } from '@/models/login'
import { api } from '@/models/myFetch'

const name = ref('')
const email = ref('')
const password = ref('')
const signupError = ref('')
const router = useRouter()
const { login } = getLogin()

const handleSignup = async () => {
  const existingUser = await api('users', { email: email.value }, 'POST')
  if (existingUser) {
    signupError.value = 'Email already exists'
  } else {
    const newUser = {
      id: Date.now(),
      name: name.value,
      email: email.value,
      password: password.value,
      role: 'user',
      friends: [],
      image: 'User.jpg',
      token: 'dummy-token'
    }
    await api('users', newUser, 'POST')
    localStorage.setItem('session', JSON.stringify(newUser))
    login(newUser)
    router.push('/dashboard')
  }
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
      <button class="button is-primary" @click="handleSignup">Signup</button>
    </div>
  </section>
</template>

<style scoped>
.error {
  color: red;
}
</style>
