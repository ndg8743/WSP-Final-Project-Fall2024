<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { ref, onMounted } from 'vue'
import UserManagement from '@/components/UserManagement.vue'
import Modal from '@/components/Modal.vue'
import { api } from '@/models/myFetch'

const users = ref([]) 
const currentUser = ref(null)
const showModal = ref(false)
const isAdmin = ref(false)
const isAddingUser = ref(false)
const loading = ref(true)
const error = ref('')

const session = localStorage.getItem('session')
const loggedInUser = session ? JSON.parse(session).users : null

onMounted(async () => {
  try {
    if (loggedInUser && loggedInUser.role === 'admin') {
      isAdmin.value = true
      const usersFromApi = await api('users')
      users.value = usersFromApi.data || []
    } else {
      isAdmin.value = false
      router.push('/'); // Redirect non-admin users to home page
    }
  } catch (err) {
    console.error('Error fetching users:', err)
    error.value = 'Failed to load user data. Please try again later.'
  } finally {
    loading.value = false
  }
})

const handleEdit = (user) => {
  currentUser.value = { ...user, friends: user.friends || [] }
  isAddingUser.value = false
  showModal.value = true
}

const handleDelete = async (id) => {
  try {
    await api('users/' + id, {}, 'DELETE')
    users.value = users.value.filter((u) => u.id !== id)
  } catch (err) {
    console.error('Error deleting user:', err)
  }
}

const handleAddUser = () => {
  currentUser.value = { id: null, name: '', email: '', role: 'User' }
  isAddingUser.value = true
  showModal.value = true
}

const saveUser = async () => {
  try {
    if (isAddingUser.value) {
      const response = await api('users', currentUser.value, 'POST')
      users.value.push(response.data)
    } else {
      const response = await api(`users/${currentUser.value.id}`, currentUser.value, 'PATCH')
      const index = users.value.findIndex((u) => u.id === currentUser.value.id)
      if (index !== -1) users.value.splice(index, 1, response.data)
    }
    closeModal()
  } catch (err) {
    console.error('Error saving user:', err)
  }
}

const closeModal = () => {
  showModal.value = false
}
</script>

<template>
  <section v-if="isAdmin && !loading" class="section">
    <div class="container">
      <h1 class="title">User Management</h1>
      <button class="button is-primary" @click="handleAddUser">Add New User</button>
      <table class="table is-fullwidth mt-4">
        <thead>
          <tr>
            <th>User</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <UserManagement v-for="user in users" :key="user.id" :user="user" @edit-user="handleEdit"
            @delete-user="handleDelete" />
        </tbody>
      </table>

      <Modal v-if="showModal" @close="closeModal">
        <template #header>
          <p>{{ isAddingUser ? 'Add New User' : 'Edit User' }}</p>
        </template>
        <template #body>
          <div class="field">
            <label class="label">Name</label>
            <input class="input" v-model="currentUser.name" />
          </div>
          <div class="field">
            <label class="label">Email</label>
            <input class="input" type="email" v-model="currentUser.email" />
          </div>
          <div class="field">
            <label class="label">Role</label>
            <div class="select">
              <select v-model="currentUser.role">
                <option>Admin</option>
                <option>User</option>
              </select>
            </div>
          </div>
        </template>
        <template #footer>
          <button class="button is-success" @click="saveUser">Save</button>
        </template>
      </Modal>
    </div>
  </section>

  <section v-else-if="loading" class="section">
    <div class="container">
      <h1 class="title">Loading...</h1>
    </div>
  </section>

  <section v-else class="section">
    <div class="container">
      <h1 class="title">Access Denied</h1>
      <p>You do not have permission to view this page.</p>
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
</style>
