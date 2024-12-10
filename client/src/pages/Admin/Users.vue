<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { ref, onMounted } from 'vue'
import UserManagement from '@/components/UserManagement.vue'
import Modal from '@/components/Modal.vue'
import { getUsers } from '@/models/users'

// Load users from users.json
const users = ref([])
const currentUser = ref(null)
const showModal = ref(false)
const isAdmin = ref(false) // Flag to check if the user is an admin
const isAddingUser = ref(false) // Flag for add mode

// Retrieve the current user from localStorage session
const session = localStorage.getItem('session')
const loggedInUser = session ? JSON.parse(session) : null

onMounted(async () => {
  if (loggedInUser && loggedInUser.user.role === 'admin') {
    isAdmin.value = true
    // Fetch users from the API
    const response = await getUsers()
    if (response.isSuccess) {
      users.value = response.data
    } else {
      console.error('Error fetching users:', response.message)
    }
  } else {
    isAdmin.value = false
  }
})

// Handle editing a user
const handleEdit = (user) => {
  currentUser.value = { ...user }
  isAddingUser.value = false
  showModal.value = true
}

// Handle deleting a user
const handleDelete = async (id) => {
  const response = await deleteUsers(id)
  if (response.isSuccess) {
    users.value = users.value.filter(u => u.id !== id)
  } else {
    console.error('Error deleting user:', response.message)
  }
}

// Handle adding a new user
const handleAddUser = () => {
  currentUser.value = { id: Date.now(), name: '', email: '', role: 'User' }
  isAddingUser.value = true
  showModal.value = true
}

// Save user updates or add new user
const saveUser = async () => {
  const user = { ...currentUser.value }

  if (isAddingUser.value) {
    const response = await addUser(user)
    if (response.isSuccess) {
      users.value.push(response.data)
    } else {
      console.error('Error adding user:', response.message)
    }
  } else {
    const response = await updateUsers(currentUser.value.user.id, user)
    if (response.isSuccess) {
      const index = users.value.findIndex(u => u.id === currentUser.value.user.id)
      if (index !== -1) users.value.splice(index, 1, response.data)
    } else {
      console.error('Error updating user:', response.message)
    }
  }

  closeModal()
}

const closeModal = () => {
  showModal.value = false
}
</script>

<template>
  <section v-if="isAdmin" class="section">
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
          <div class="field">
            <label class="label">Name</label>
            <input class="input" v-model="currentUser.user.name" />
          </div>
          <div class="field">
            <label class="label">Email</label>
            <input class="input" type="email" v-model="currentUser.user.email" />
          </div>
          <div class="field">
            <label class="label">Role</label>
            <div class="select">
              <select v-model="currentUser.user.role">
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
