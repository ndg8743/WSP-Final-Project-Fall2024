<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
// @ts-ignore
import UserManagement from '../../components/UserManagement.vue'
// @ts-ignore
import Modal from '../../components/Modal.vue'
import { getUsers, addUser, updateUsers, deleteUsers } from '../../models/users.js'
import type { Users, UserResponse } from '../../models/users.js'
import { getSession } from '../../models/login.js'

const router = useRouter()
const session = getSession()
const users = ref<UserResponse[]>([])
const currentUser = ref<Users | null>(null)
const showModal = ref(false)
const isLoading = ref(false)
const isAddingUser = ref(false)

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

// Handle editing a user
const handleEdit = (user: UserResponse) => {
  if (!checkAdminAccess()) return

  currentUser.value = { ...user }
  isAddingUser.value = false
  showModal.value = true
}

// Handle deleting a user
const handleDelete = async (id: number) => {
  if (!checkAdminAccess()) return

  const confirmDelete = confirm("Are you sure you want to delete this user?")
  if (!confirmDelete) return

  try {
    isLoading.value = true
    const response = await deleteUsers(id)
    if (response.isSuccess) {
      users.value = users.value.filter((user) => user.id !== id)
    } else {
      console.error("Error deleting user:", response.message)
    }
  } catch (error: unknown) {
    console.error("Error deleting user:", error)
    if (error instanceof Error && error.message === 'Session expired') {
      router.push('/login')
    }
  } finally {
    isLoading.value = false
  }
}

// Handle adding a new user
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

// Save changes for editing or adding a user
const saveUser = async () => {
  if (!checkAdminAccess() || !currentUser.value) return

  try {
    isLoading.value = true
    let response
    if (isAddingUser.value) {
      response = await addUser(currentUser.value)
    } else if (currentUser.value.id) {
      response = await updateUsers(currentUser.value.id, currentUser.value)
    } else {
      throw new Error('Invalid user data')
    }

    if (response.isSuccess) {
      if (isAddingUser.value) {
        users.value.push(response.data)
      } else {
        const index = users.value.findIndex((u) => u.id === currentUser.value?.id)
        if (index !== -1) users.value[index] = response.data
      }
      closeModal()
    } else {
      console.error("Error saving user:", response.message)
    }
  } catch (error: unknown) {
    console.error("Error saving user:", error)
    if (error instanceof Error && error.message === 'Session expired') {
      router.push('/login')
    }
  } finally {
    isLoading.value = false
  }
}

const closeModal = () => {
  showModal.value = false
  currentUser.value = null
}

onMounted(async () => {
  if (!checkAdminAccess()) return

  try {
    isLoading.value = true
    const response = await getUsers()
    if (response.isSuccess) {
      users.value = response.data
    } else {
      console.error('Error fetching users:', response.message)
    }
  } catch (error: unknown) {
    console.error('Error fetching users:', error)
    if (error instanceof Error && error.message === 'Session expired') {
      router.push('/login')
    }
  } finally {
    isLoading.value = false
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
        <h1 class="title">User Management</h1>
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

        <table class="table is-fullwidth mt-4" v-else>
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
                <input class="input" v-model="currentUser.name" :disabled="isLoading" />
              </div>
              <div class="field">
                <label class="label">Email</label>
                <input class="input" type="email" v-model="currentUser.email" :disabled="isLoading" />
              </div>
              <div class="field">
                <label class="label">Role</label>
                <div class="select">
                  <select v-model="currentUser.role" :disabled="isLoading">
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                  </select>
                </div>
              </div>
              <div v-if="isAddingUser" class="field">
                <label class="label">Password</label>
                <input class="input" type="password" v-model="currentUser.password" :disabled="isLoading" />
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

.mt-4 {
  margin-top: 1rem;
}

.modal-form {
  padding: 1rem;
}

.field {
  margin-bottom: 1rem;
}

.button + .button {
  margin-left: 0.5rem;
}
</style>
