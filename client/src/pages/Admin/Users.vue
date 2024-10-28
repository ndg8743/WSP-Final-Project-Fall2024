<!-- UserManagementPage.vue -->
<script setup>
import { ref, onMounted } from 'vue'
import UserManagement from '@/components/UserManagement.vue'
import Modal from '@/components/Modal.vue'
import usersData from '@/data/users.json'

// Load users from users.json
const users = ref([...usersData]) // Editable user list
const currentUser = ref(null)
const showModal = ref(false)
const isAdmin = ref(false) // Flag to check if the user is an admin
const isAddingUser = ref(false) // Flag for add mode

// Retrieve the current user from localStorage session
const session = localStorage.getItem('session')
const loggedInUser = session ? JSON.parse(session) : null

onMounted(() => {
  if (loggedInUser && loggedInUser.role === 'admin') {
    isAdmin.value = true
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
const handleDelete = (id) => {
  users.value = users.value.filter(u => u.id !== id)
}

// Handle adding a new user
const handleAddUser = () => {
  currentUser.value = { id: Date.now(), name: '', email: '', role: 'User' }
  isAddingUser.value = true
  showModal.value = true
}

// Save user updates or add new user
const saveUser = () => {
  if (isAddingUser.value) {
    users.value.push({ ...currentUser.value })
  } else {
    const index = users.value.findIndex(u => u.id === currentUser.value.id)
    if (index !== -1) users.value.splice(index, 1, { ...currentUser.value })
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
