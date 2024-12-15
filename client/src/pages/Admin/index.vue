<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getUsers } from '../../models/users.js'
import { getSession } from '../../models/login.js'

const router = useRouter()
const session = getSession()
const totalUsers = ref(0)
const lastLogin = ref('')
const isLoading = ref(false)
const error = ref('')

const checkAdminAccess = () => {
  if (!session.token || !session.user?.id) {
    router.push('/login')
    return false
  }
  return session.user.role === 'admin'
}

const loadAdminData = async () => {
  if (!checkAdminAccess()) return

  isLoading.value = true
  error.value = ''

  try {
    const response = await getUsers()
    if (response.isSuccess) {
      totalUsers.value = response.total
      lastLogin.value = new Date().toLocaleString()
    } else {
      error.value = response.message || 'Failed to fetch users'
    }
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === 'Session expired') {
        router.push('/login')
      } else {
        error.value = err.message
      }
    }
  } finally {
    isLoading.value = false
  }
}

// Watch for session changes
watch(() => session.token, (newToken: string | null) => {
  if (!newToken) {
    router.push('/login')
  }
})

watch(() => session.user?.role, (newRole: string | undefined) => {
  if (newRole !== 'admin') {
    error.value = 'You do not have administrator privileges'
  }
})

onMounted(loadAdminData)
</script>

<template>
  <section class="section">
    <div class="container">
      <template v-if="session.token && session.user?.role === 'admin'">
        <h1 class="title">Admin Dashboard</h1>
        
        <div v-if="error" class="notification is-danger">
          {{ error }}
        </div>

        <div v-if="isLoading" class="mt-4">
          <progress class="progress is-small is-primary" max="100">Loading...</progress>
        </div>

        <template v-else>
          <div class="box">
            <p>Welcome to the admin panel. Here you can manage users and system settings.</p>
            <div class="buttons mt-4">
              <router-link to="/admin/users" class="button is-primary">
                Manage Users
              </router-link>
            </div>
          </div>

          <div class="box">
            <h2 class="subtitle">Quick Statistics</h2>
            <p><strong>Total Users:</strong> {{ totalUsers }}</p>
            <p><strong>Last Login:</strong> {{ lastLogin }}</p>
          </div>
        </template>
      </template>

      <template v-else-if="session.token">
        <div class="box has-text-centered">
          <h1 class="title has-text-danger">Access Denied</h1>
          <p class="subtitle">You must be an admin to use this page.</p>
          <div class="buttons is-centered mt-4">
            <router-link to="/" class="button is-primary">Return to Dashboard</router-link>
            <button @click="router.back()" class="button">Go Back</button>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="notification is-warning">
          Please log in to continue.
        </div>
      </template>
    </div>
  </section>
</template>
