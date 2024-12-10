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
    // Check if the email is already taken
    const response = await addUser({
      id: Date.now(),
      name: name.value,
      email: email.value,
      password: password.value,
      role: 'user',
      friends: [],
      image: 'User.jpg',
    })

    if (response.isSuccess) {
      const newUser = response.data
      localStorage.setItem('session', JSON.stringify(newUser)) // Store new user in session
      login(newUser.email, newUser.password) // Log in the new user by updating the auth state

      router.push('/dashboard') // Redirect to dashboard after successful signup
    } else {
      signupError.value = response.message || 'Error creating user.'
    }
  } catch (error) {
    console.error('Signup error:', error)
    signupError.value = 'An unexpected error occurred. Please try again.'
  }
}

// Stub for server-side saving (requires backend)
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
      <button class="button is-primary" @click="handleSignup">Signup</button>
    </div>
  </section>
</template>

<style scoped>
.error {
  color: red;
}
</style>
