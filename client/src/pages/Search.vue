<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import usersData from '@/data/users.json'

// Retrieve the current user from session
const session = localStorage.getItem('session')
const currentUser = session ? JSON.parse(session) : null

const searchQuery = ref('')
const friends = ref(currentUser ? currentUser.friends : []) // Initialize friends list

// Filtered users based on search query
const filteredUsers = computed(() => {
  return usersData.filter(user =>
    user.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// Add a user to the friend list
const addFriend = (userId: number) => {
  if (currentUser && !friends.value.includes(userId)) {
    friends.value.push(userId) // Add user ID to the current user's friend list
    localStorage.setItem('session', JSON.stringify({ ...currentUser, friends: friends.value })) // Update session
    const user = usersData.find(user => user.id === userId)
    if (user) {
      alert(`${user.name} has been added to your friends.`)
    }
  } else if (friends.value.includes(userId)) {
    alert("This user is already your friend.")
  }
}
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
              @click="addFriend(user.id)"
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
