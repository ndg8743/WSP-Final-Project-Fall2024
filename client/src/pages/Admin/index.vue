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

const checkAdminAccess = () => {
  if (!session.token || !session.user?.id) {
    router.push('/login')
    return false
  }
  if (session.user.role !== 'admin') {
    router.push('/unauthorized')
    return false
  }
  return true
}

onMounted(async () => {
  if (!checkAdminAccess()) return

  try {
    const response = await getUsers()
    if (response.isSuccess) {
      totalUsers.value = response.total
      lastLogin.value = new Date().toLocaleString()
    } else {
      console.error('Failed to fetch users:', response.message)
    }
  } catch (error: unknown) {
    console.error('Error fetching users:', error)
    if (error instanceof Error && error.message === 'Session expired') {
      router.push('/login')
    }
  }
})

// Watch for session changes
watch(() => session.token, (newToken: string | null) => {
  if (!newToken) {
    router.push('/login')
    return
  }
  if (session.user?.role !== 'admin') {
    router.push('/unauthorized')
  }
})

watch(() => session.user?.role, (newRole: string | undefined) => {
  if (newRole !== 'admin') {
    router.push('/unauthorized')
  }
})
</script>

<template>
  <section class="section">
    <div class="container">
      <template v-if="session.token && session.user?.role === 'admin'">
        <h1 class="title">Admin Dashboard</h1>
        <div class="box">
          <p>Welcome to the admin panel. Here you can manage users and modify app settings.</p>
          <div class="buttons">
            <router-link to="/admin/users" class="button is-link">Manage Users</router-link>
            <router-link to="/admin/settings" class="button is-link">App Settings</router-link>
          </div>
        </div>

        <!-- Statistics or Other Admin Info -->
        <div class="box">
          <h2 class="subtitle">Quick Statistics</h2>
          <p><strong>Total Users:</strong> {{ totalUsers }}</p>
          <p><strong>Last Login:</strong> {{ lastLogin }}</p>
        </div>
      </template>
      <div v-else>
        <p class="notification is-danger">You do not have permission to access this page.</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.section {
  padding-top: 2rem;
}
.buttons {
  margin-top: 15px;
}
</style>
