<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
// @ts-ignore
import UserManagement from '../../components/UserManagement.vue'
// @ts-ignore
import Modal from '../../components/Modal.vue'
import { getUsers, addUser, updateUser, deleteUser, type User, type UserResponse } from '../../models/users.js'
import { getSession } from '../../models/login.js'

const router = useRouter()
const session = getSession()
const users = ref<UserResponse[]>([])
const currentUser = ref<Partial<User> | null>(null)
const showModal = ref(false)
const isLoading = ref(false)
const error = ref('')
const isAddingUser = ref(false)

const checkAdminAccess = () => {
  if (!session.token || !session.user?.id) {
    router.push('/login')
    return false
  }
  return session.user.role === 'admin'
}

const loadUsers = async () => {
  if (!checkAdminAccess()) return

  try {
    isLoading.value = true
    error.value = ''
    const response = await getUsers()
    if (response.isSuccess) {
      users.value = response.data
    } else {
      error.value = response.message || 'Error fetching users'
    }
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === 'Session expired') {
        router.push('/login')
      } else {
        error.value = err.message
      }
    } else {
      error.value = 'An unexpected error occurred'
    }
  } finally {
    isLoading.value = false
  }
}

const handleEdit = (user: UserResponse) => {
  if (!checkAdminAccess()) return

  currentUser.value = { ...user }
  isAddingUser.value = false
  showModal.value = true
}

const handleDelete = async (id: number) => {
  if (!checkAdminAccess()) return

  const confirmDelete = confirm("Are you sure you want to delete this user?")
  if (!confirmDelete) return

  try {
    isLoading.value = true
    error.value = ''
    const response = await deleteUser(id)
    if (response.isSuccess) {
      users.value = users.value.filter((user) => user.id !== id)
    } else {
      error.value = response.message || "Error deleting user"
    }
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === 'Session expired') {
        router.push('/login')
      } else {
        error.value = err.message
      }
    } else {
      error.value = 'An unexpected error occurred'
    }
  } finally {
    isLoading.value = false
  }
}

const handleAddUser = () => {
  if (!checkAdminAccess()) return

  currentUser.value = {
    name: '',
    email: '',
    password: '',
    role: 'user',
    friends: []
  }
  isAddingUser.value = true
  showModal.value = true
}

const saveUser = async () => {
  if (!checkAdminAccess() || !currentUser.value) return

  try {
    isLoading.value = true
    error.value = ''
    let response
    if (isAddingUser.value) {
      response = await addUser(currentUser.value as Omit<User, 'id'>)
    } else if (currentUser.value.id) {
      response = await updateUser(currentUser.value.id, currentUser.value)
    } else {
      throw new Error('Invalid user data')
    }

    if (response.isSuccess) {
      if (isAddingUser.value) {
        users.value.push(response.data)
      } else {
        const index = users.value.findIndex((u) => u.id === currentUser.value!.id)
        if (index !== -1) users.value[index] = response.data
      }
      closeModal()
    } else {
      error.value = response.message || "Error saving user"
    }
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === 'Session expired') {
        router.push('/login')
      } else {
        error.value = err.message
      }
    } else {
      error.value = 'An unexpected error occurred'
    }
  } finally {
    isLoading.value = false
  }
}

const closeModal = () => {
  showModal.value = false
  currentUser.value = null
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

onMounted(loadUsers)
</script>

<template>
  <section class="section">
    <div class="container">
      <template v-if="session.token && session.user?.role === 'admin'">
        <h1 class="title">User Management</h1>

        <div v-if="error" class="notification is-danger">
          {{ error }}
        </div>

        <button 
          class="button is-primary" 
          @click="handleAddUser"
          :disabled="isLoading"
        >
          Add New User
        </button>

        <div v-if="isLoading" class="mt-4">
          <progress class="progress is-small is-primary" max="100">Loading...</progress>
        </div>

        <table v-else class="table is-fullwidth mt-4">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <UserManagement 
              v-for="user in users" 
              :key="user.id" 
              :user="user" 
              @edit-user="handleEdit"
              @delete-user="handleDelete" 
            />
          </tbody>
        </table>

        <Modal v-if="showModal" @close="closeModal">
          <template #header>
            <p>{{ isAddingUser ? 'Add New User' : 'Edit User' }}</p>
          </template>
          <template #body>
            <div v-if="currentUser" class="modal-form">
              <div class="field">
                <label class="label">Name</label>
                <input 
                  class="input" 
                  v-model="currentUser.name" 
                  :disabled="isLoading"
                />
              </div>
              <div class="field">
                <label class="label">Email</label>
                <input 
                  class="input" 
                  type="email" 
                  v-model="currentUser.email" 
                  :disabled="isLoading"
                />
              </div>
              <div class="field">
                <label class="label">Role</label>
                <div class="select">
                  <select 
                    v-model="currentUser.role"
                    :disabled="isLoading"
                  >
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                  </select>
                </div>
              </div>
              <div v-if="isAddingUser" class="field">
                <label class="label">Password</label>
                <input 
                  class="input" 
                  type="password" 
                  v-model="currentUser.password"
                  :disabled="isLoading"
                />
              </div>
            </div>
          </template>
          <template #footer>
            <button 
              class="button is-success" 
              @click="saveUser"
              :class="{ 'is-loading': isLoading }"
              :disabled="isLoading"
            >
              Save
            </button>
            <button 
              class="button" 
              @click="closeModal"
              :disabled="isLoading"
            >
              Cancel
            </button>
          </template>
        </Modal>
      </template>

      <template v-else-if="session.token">
        <div class="box has-text-centered">
          <h1 class="title has-text-danger">Access Denied</h1>
          <p class="subtitle">You do not have administrator privileges to access this page.</p>
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
