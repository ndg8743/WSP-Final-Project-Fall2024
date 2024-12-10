<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getUsers, addFriend } from '@/models/users'

// Retrieve the current user from session
const session = localStorage.getItem('session')
const currentUser = session ? JSON.parse(session) : null

const searchQuery = ref('')
const friends = ref(currentUser && Array.isArray(currentUser.user.friends) ? currentUser.user.friends : [])
const users = ref([]) // Reactive array to hold users data
const isLoading = ref(false)

const fetchUsers = async () => {
  isLoading.value = true
  const response = await getUsers()
  if (response.isSuccess) {
    users.value = response.data
  } else {
    console.error('Error fetching users:', response.message)
  }
  isLoading.value = false
}

// Filtered users based on search query
const filteredUsers = computed(() => {
  return users.value.filter(user =>
    user.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// Add a user to the friend list (backend + frontend update)
const handleAddFriend = async (friendId: number) => {
  if (currentUser && !friends.value.includes(friendId)) {
    const response = await addFriend(currentUser.user.id, friendId)
    if (response.isSuccess) {
      friends.value.push(friendId) // Update friends list locally
      localStorage.setItem(
        'session',
        JSON.stringify({ ...currentUser, friends: friends.value })
      ) // Update session
      const user = users.value.find(user => user.id === friendId)
      if (user) {
        alert(`${user.name} has been added to your friends.`)
      }
    } else {
      console.error('Error adding friend:', response.message)
    }
  } else if (friends.value.includes(friendId)) {
    alert('This user is already your friend.')
  }
}

onMounted(fetchUsers)
</script>

<template>
  <section class="section">
    <div class="container">
      <h1 class="title">Search Users</h1>
      <div v-if="currentUser">
        <div class="field">
          <input class="input" type="text" placeholder="Search by name" v-model="searchQuery" />
        </div>
        <ul>
          <li v-for="user in filteredUsers" :key="user.id">
            {{ user.name }} - {{ user.email }}
            <button
              v-if="!friends.includes(user.id)"
              class="button is-small is-primary ml-2"
              @click="handleAddFriend(user.id)"
            >
              Add Friend
            </button>
            <span v-else class="tag is-info ml-2">Already a Friend</span>
          </li>
        </ul>
      </div>
      <div v-else>
        <p class="notification is-danger">Please log in to search and add friends.</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.section {
  padding-top: 2rem;
}
.ml-2 {
  margin-left: 0.5rem;
}
.notification {
  margin-top: 1rem;
}
</style>
