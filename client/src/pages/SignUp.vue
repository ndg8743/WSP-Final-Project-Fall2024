<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { getLogin } from '@/models/login' // Import getLogin
import { addUser } from '@/models/users'

const name = ref('')
const email = ref('')
const password = ref('')
const signupError = ref('')
const router = useRouter()
const { login } = getLogin() // Destructure login from getLogin

const handleSignup = async () => {
  try {
    // Create a new user object
    const response = await addUser({
      id: Date.now(),
      name: name.value,
      email: email.value,
      password: password.value,
      role: 'user',
      friends: [],
      image: '../src/assets/User.jpg',
    })

    if (response.isSuccess) {
      // Save session data
      localStorage.setItem('session', JSON.stringify(response.data))

      // Redirect to dashboard after signup
      router.push('/dashboard')
    } else {
      signupError.value = response.message || 'Signup failed. Please try again.'
    }
  } catch (error) {
    console.error('Signup error:', error)
    signupError.value = 'An unexpected error occurred. Please try again.'
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
        <input class="input" type="text" v-model="name" placeholder="Enter your name" />
      </div>
      <div class="field">
        <label class="label">Email</label>
        <input class="input" type="email" v-model="email" placeholder="Enter your email" />
      </div>
      <div class="field">
        <label class="label">Password</label>
        <input class="input" type="password" v-model="password" placeholder="Enter your password" />
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
