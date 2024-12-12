<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getUsers, addFriend, removeFriend, type Users } from '@/models/users'

// Retrieve the current user from session
const session = localStorage.getItem('session')
const currentUser = session ? JSON.parse(session) : null

const searchQuery = ref('')
const friends = ref(
  currentUser && Array.isArray(currentUser.user.friends) ? currentUser.user.friends : []
)
const users = ref<Users[]>([]) // Reactive array to hold users data
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
  return users.value.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// Add a user to the friend list (backend + frontend update)
const handleAddFriend = async (friendId: number) => {
  if (!currentUser) {
    alert("You must be logged in to add friends.");
    return;
  }

  if (friends.value.includes(friendId)) {
    alert("This user is already your friend.");
    return;
  }

  try {
    const response = await addFriend(currentUser.user.id, friendId);

    if (response.isSuccess) {
      friends.value.push(friendId); // Update local friends list
      currentUser.user.friends = friends.value; // Update session data
      localStorage.setItem("session", JSON.stringify(currentUser));
      alert("Friend added successfully.");
    } else {
      alert("Failed to add friend. Please try again.");
    }
  } catch (error) {
    console.error("Error in handleAddFriend:", error);
    alert("An error occurred while adding a friend.");
  }
}

const handleRemoveFriend = async (friendId: number) => {
  if (!currentUser) {
    alert("You must be logged in to remove friends.");
    return;
  }

  try {
    const response = await removeFriend(currentUser.user.id, friendId);

    if (response.isSuccess) {
      friends.value = friends.value.filter((id: number) => id !== friendId); // Update local friends list
      currentUser.user.friends = friends.value; // Update session data
      localStorage.setItem("session", JSON.stringify(currentUser));
      alert("Friend removed successfully.");
    } else {
      alert("Failed to remove friend. Please try again.");
    }
  } catch (error) {
    console.error("Error in handleRemoveFriend:", error);
    alert("An error occurred while removing a friend.");
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
            <button v-if="!friends.includes(user.id)" class="button is-small is-primary ml-2"
              @click="handleAddFriend(user.id)">
              Add Friend
            </button>
            <button v-else class="button is-small is-danger ml-2"
              @click="handleRemoveFriend(user.id)">
              Remove Friend
            </button>
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
