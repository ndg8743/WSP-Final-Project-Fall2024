<template>
    <section class="section">
      <div class="container">
        <h1 class="title">User Management</h1>
        <table class="table is-fullwidth">
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
              @edit="handleEdit"
              @delete="handleDelete"
            />
          </tbody>
        </table>
  
        <!-- Modal for Editing User -->
        <modal v-if="showModal" @close="closeModal">
          <template #header>
            <p>Edit User</p>
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
        </modal>
      </div>
    </section>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import UserManagement from '@/components/UserManagement.vue';
  import Modal from '@/components/Modal.vue';
  
  // Mock user data
  const users = ref([
    { id: 1, name: 'John Doe', email: 'john.doe@example.com', role: 'Admin' },
    { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', role: 'User' },
  ]);
  
  const currentUser = ref(null);
  const showModal = ref(false);
  
  const handleEdit = (user) => {
    currentUser.value = { ...user };
    showModal.value = true;
  };
  
  const handleDelete = (id) => {
    users.value = users.value.filter(u => u.id !== id);
  };
  
  const saveUser = () => {
    const index = users.value.findIndex(u => u.id === currentUser.value.id);
    users.value.splice(index, 1, { ...currentUser.value });
    closeModal();
  };
  
  const closeModal = () => {
    showModal.value = false;
  };
  </script>
  
  <style scoped>
  .section {
    padding-top: 2rem;
  }
  </style>
  