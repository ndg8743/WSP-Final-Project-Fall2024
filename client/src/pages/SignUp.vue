<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { getLogin } from '../models/login.js'
import { addUser } from '../models/users.js'

const router = useRouter()
const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const signupError = ref('')
const isLoading = ref(false)
const { login } = getLogin()

const validateForm = () => {
  if (!name.value || !email.value || !password.value || !confirmPassword.value) {
    signupError.value = 'All fields are required'
    return false
  }

  if (password.value !== confirmPassword.value) {
    signupError.value = 'Passwords do not match'
    return false
  }

  if (password.value.length < 6) {
    signupError.value = 'Password must be at least 6 characters long'
    return false
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value)) {
    signupError.value = 'Please enter a valid email address'
    return false
  }

  return true
}

const handleSignup = async () => {
  try {
    if (!validateForm()) {
      return
    }

    isLoading.value = true
    signupError.value = ''

    // Create a new user
    const response = await addUser({
      name: name.value,
      email: email.value,
      password: password.value,
      role: 'user'
    })

    if (!response.isSuccess) {
      signupError.value = response.message || 'Signup failed. Please try again.'
      return
    }

    // Attempt to login with the new credentials
    try {
      await login(email.value, password.value)
      // Login successful - navigation is handled in login function
    } catch (loginError) {
      console.error('Auto-login error:', loginError)
      signupError.value = 'Account created but login failed. Please try logging in manually.'
      router.push('/login')
    }
  } catch (error) {
    console.error('Signup error:', error)
    signupError.value = error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.'
  } finally {
    isLoading.value = false
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !isLoading.value) {
    handleSignup()
  }
}
</script>

<template>
  <section class="section">
    <div class="container">
      <div class="box signup-box">
        <h1 class="title has-text-centered">Sign Up</h1>
        
        <div v-if="signupError" class="notification is-danger">
          {{ signupError }}
        </div>

        <div class="field">
          <label class="label">Username</label>
          <div class="control">
            <input 
              class="input" 
              type="text" 
              v-model="name" 
              placeholder="Enter your username"
              @keydown="handleKeydown"
              :disabled="isLoading"
            />
          </div>
        </div>

        <div class="field">
          <label class="label">Email</label>
          <div class="control">
            <input 
              class="input" 
              type="email" 
              v-model="email" 
              placeholder="Enter your email"
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
              v-model="password" 
              placeholder="Enter your password"
              @keydown="handleKeydown"
              :disabled="isLoading"
            />
          </div>
        </div>

        <div class="field">
          <label class="label">Confirm Password</label>
          <div class="control">
            <input 
              class="input" 
              type="password" 
              v-model="confirmPassword" 
              placeholder="Confirm your password"
              @keydown="handleKeydown"
              :disabled="isLoading"
            />
          </div>
        </div>

        <div class="field">
          <div class="control">
            <button 
              class="button is-primary is-fullwidth"
              :class="{ 'is-loading': isLoading }"
              @click="handleSignup"
              :disabled="isLoading"
            >
              Sign Up
            </button>
          </div>
        </div>

        <div class="has-text-centered mt-4">
          <p>
            Already have an account? 
            <router-link 
              to="/login"
              :class="{ 'is-disabled': isLoading }"
            >
              Login here
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.signup-box {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
}

.mt-4 {
  margin-top: 1rem;
}

.is-disabled {
  pointer-events: none;
  opacity: 0.6;
}
</style>
