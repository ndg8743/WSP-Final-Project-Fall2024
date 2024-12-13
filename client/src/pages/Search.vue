<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getUsers, addFriend, removeFriend, type UserResponse } from '../models/users.js'
import { getSession } from '../models/login.js'

const router = useRouter()
const session = getSession()
const searchQuery = ref('')
const friends = ref<number[]>(
  Array.isArray(session.user?.friends) ? session.user.friends : []
)
const users = ref<UserResponse[]>([])
const isLoading = ref(false)
const error = ref('')

const fetchUsers = async () => {
  if (!session.token || !session.user?.id) {
    router.push('/login')
    return
  }

  isLoading.value = true
  error.value = ''
  
  try {
    const response = await getUsers()
    if (response.isSuccess) {
      // Filter out the current user from the list
      users.value = response.data.filter(user => user.id !== session.user?.id)
    } else {
      error.value = response.message || 'Error fetching users'
      console.error('Error fetching users:', response.message)
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An error occurred'
    error.value = message
    console.error('Error in fetchUsers:', err)
    if (message === 'Session expired') {
      router.push('/login')
    }
  } finally {
    isLoading.value = false
  }
}

// Filtered users based on search query
const filteredUsers = computed(() => {
  return users.value.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// Add a user to the friend list
const handleAddFriend = async (friendId: number) => {
  if (!session.user?.id) {
    router.push('/login')
    return
  }

  if (friends.value.includes(friendId)) {
    error.value = "This user is already your friend."
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    const response = await addFriend(session.user.id, friendId)

    if (response.isSuccess) {
      friends.value.push(friendId)
      if (session.user) {
        session.user.friends = friends.value
        localStorage.setItem("session", JSON.stringify({
          token: session.token,
          user: session.user
        }))
      }
    } else {
      error.value = response.message || "Failed to add friend"
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An error occurred'
    error.value = message
    console.error("Error in handleAddFriend:", err)
    if (message === 'Session expired') {
      router.push('/login')
    }
  } finally {
    isLoading.value = false
  }
}

const handleRemoveFriend = async (friendId: number) => {
  if (!session.user?.id) {
    router.push('/login')
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    const response = await removeFriend(session.user.id, friendId)

    if (response.isSuccess) {
      friends.value = friends.value.filter(id => id !== friendId)
      if (session.user) {
        session.user.friends = friends.value
        localStorage.setItem("session", JSON.stringify({
          token: session.token,
          user: session.user
        }))
      }
    } else {
      error.value = response.message || "Failed to remove friend"
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An error occurred'
    error.value = message
    console.error("Error in handleRemoveFriend:", err)
    if (message === 'Session expired') {
      router.push('/login')
    }
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchUsers)
</script>

<template>
  <section class="section">
    <div class="container">
      <h1 class="title">Search Users</h1>
      
      <div v-if="session.token && session.user">
        <div class="field">
          <div class="control">
            <input 
              class="input" 
              type="text" 
              placeholder="Search by name" 
              v-model="searchQuery"
              :disabled="isLoading"
            />
          </div>
        </div>

        <div v-if="error" class="notification is-danger">
          {{ error }}
        </div>

        <div v-if="isLoading" class="mt-4">
          <progress class="progress is-small is-primary" max="100">Loading...</progress>
        </div>

        <div v-else-if="filteredUsers.length === 0" class="notification is-info mt-4">
          No users found.
        </div>

        <div v-else class="mt-4">
          <div v-for="user in filteredUsers" :key="user.id" class="box">
            <div class="level">
              <div class="level-left">
                <div class="level-item">
                  <figure class="image is-48x48 mr-3">
                    <img :src="user.image || '/assets/User.jpg'" :alt="user.name">
                  </figure>
                  <div>
                    <p class="title is-5">{{ user.name }}</p>
                    <p class="subtitle is-6">{{ user.email }}</p>
                  </div>
                </div>
              </div>
              <div class="level-right">
                <div class="level-item">
                  <button 
                    v-if="!friends.includes(user.id)" 
                    class="button is-primary"
                    :class="{ 'is-loading': isLoading }"
                    :disabled="isLoading"
                    @click="handleAddFriend(user.id)"
                  >
                    Add Friend
                  </button>
                  <button 
                    v-else 
                    class="button is-danger"
                    :class="{ 'is-loading': isLoading }"
                    :disabled="isLoading"
                    @click="handleRemoveFriend(user.id)"
                  >
                    Remove Friend
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
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

.mt-4 {
  margin-top: 1rem;
}

.mr-3 {
  margin-right: 1rem;
}

.level-left .level-item {
  display: flex;
  align-items: center;
}

.image {
  overflow: hidden;
  border-radius: 50%;
}

.image img {
  object-fit: cover;
  width: 100%;
  height: 100%;
}

.box {
  transition: all 0.3s ease;
}

.box:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
</style>
