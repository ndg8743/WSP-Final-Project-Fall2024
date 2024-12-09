<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import type { Users } from '@/models/users.js';
import { api } from '@/models/myFetch';

const users = ref<Users | null>(null);
const router = useRouter();
const loading = ref(true);
const error = ref('');

onMounted(async () => {
  const session = localStorage.getItem('session');
  if (!session) {
    router.push('/login');
    return;
  }

  const userId = JSON.parse(session).users.id;

  try {
    const response = await api<{ data: Users }>(`users/${userId}`);
    users.value = response.data || null;
  } catch (err) {
    console.error('Error fetching users data:', err);
    error.value = 'Failed to load users data. Please try again later.';
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <section class="section">
    <div class="container">
      <div v-if="loading">
        <p>Loading...</p>
      </div>
      <div v-else-if="error">
        <p class="notification is-danger">{{ error }}</p>
      </div>
      <div v-else-if="users" class="box">
        <div class="box-content">
          <h3>{{ users.name }}</h3>
          <p>Email: {{ users.email }}</p>
          <p>Role: {{ users.role }}</p>
          <h4>Friends:</h4>
          <ul v-if="users.friends.length">
            <li v-for="friend in users.friends" :key="friend">
              Friend ID: {{ friend }}
            </li>
          </ul>
          <p v-else>No friends added yet.</p>
        </div>
      </div>
      <div v-else>
        <p class="notification is-warning">No users data available.</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
h3 {
  font-weight: bold;
}

.box-content {
  padding: 10px;
}

ul {
  list-style-type: none;
  padding: 0;
}

.notification {
  margin-top: 1rem;
}
</style>
