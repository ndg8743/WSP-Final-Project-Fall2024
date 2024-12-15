<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getUsers, addFriend, removeFriend, type UserResponse } from '../models/users'
import { getSession } from '../models/login'

interface Session {
  token: string
  user: {
    id: number
    friends: number[]
    [key: string]: any
  }
}

const router = useRouter()
const session = getSession() as Session

// Validate session before proceeding
if (!session.token || !session.user?.id) {
  router.push('/login')
}

const searchQuery = ref('')
const friends = ref<number[]>(
  Array.isArray(session.user?.friends) ? session.user.friends : []
)
const users = ref<UserResponse[]>([])
const isLoading = ref(false)
const error = ref('')

const updateSession = (updatedFriends: number[]) => {
  if (session.user) {
    session.user.friends = updatedFriends
    localStorage.setItem('session', JSON.stringify({
      token: session.token,
      user: session.user
    }))
  }
}

const handleSessionError = (message: string) => {
  if (message === 'Session expired') {
    router.push('/login')
  }
}

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
      throw new Error(response.message || 'Error fetching users')
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An error occurred'
    error.value = message
    handleSessionError(message)
  } finally {
    isLoading.value = false
  }
}

// Filtered users based on search query
const filteredUsers = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  return users.value.filter((user) =>
    user.name.toLowerCase().includes(query)
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
      const updatedFriends = [...friends.value, friendId]
      friends.value = updatedFriends
      updateSession(updatedFriends)
    } else {
      throw new Error(response.message || "Failed to add friend")
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An error occurred'
    error.value = message
    handleSessionError(message)
  } finally {
    isLoading.value = false
  }
}

const handleRemoveFriend = async (friendId: number) => {
  if (!session.user?.id) {
    router.push('/login')
    return
  }

  if (!confirm('Are you sure you want to remove this friend?')) {
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    const response = await removeFriend(session.user.id, friendId)

    if (response.isSuccess) {
      const updatedFriends = friends.value.filter(id => id !== friendId)
      friends.value = updatedFriends
      updateSession(updatedFriends)
    } else {
      throw new Error(response.message || "Failed to remove friend")
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An error occurred'
    error.value = message
    handleSessionError(message)
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchUsers)
</script>

<template>
  <section class="section">
    <div class="container">
      <h1 class="title is-2">Search Users</h1>
      
      <div v-if="session.token && session.user">
        <div class="field">
          <div class="control">
            <input 
              class="input is-large" 
              type="text" 
              placeholder="Search by name" 
              v-model="searchQuery"
              :disabled="isLoading"
              aria-label="Search users by name"
            />
          </div>
        </div>

        <div 
          v-if="error" 
          class="notification is-danger"
          role="alert"
        >
          {{ error }}
        </div>

        <div 
          v-if="isLoading" 
          class="mt-4"
          role="status"
          aria-label="Loading users"
        >
          <progress class="progress is-small is-primary" max="100">
            Loading...
          </progress>
        </div>

        <div 
          v-else-if="filteredUsers.length === 0" 
          class="notification is-info mt-4"
          role="status"
        >
          No users found.
        </div>

        <div 
          v-else 
          class="search-results"
          role="list"
          aria-label="User search results"
        >
          <div 
            v-for="user in filteredUsers" 
            :key="user.id" 
            class="box user-card"
            role="listitem"
          >
            <div class="user-info">
              <div 
                class="user-image"
                role="img"
                :aria-label="`${user.name}'s profile picture`"
              >
                <img 
                  :src="user.image || '/src/assets/User.jpg'" 
                  :alt="`${user.name}'s profile picture`"
                >
              </div>
              <div class="user-details">
                <p class="title is-4">{{ user.name }}</p>
                <p class="subtitle is-5">{{ user.email }}</p>
              </div>
              <div class="user-actions">
                <button 
                  v-if="!friends.includes(user.id)" 
                  class="button is-primary is-medium"
                  :class="{ 'is-loading': isLoading }"
                  :disabled="isLoading"
                  @click="handleAddFriend(user.id)"
                  :aria-label="`Add ${user.name} as friend`"
                >
                  Add Friend
                </button>
                <button 
                  v-else 
                  class="button is-danger is-medium"
                  :class="{ 'is-loading': isLoading }"
                  :disabled="isLoading"
                  @click="handleRemoveFriend(user.id)"
                  :aria-label="`Remove ${user.name} from friends`"
                >
                  Remove Friend
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div 
        v-else
        class="notification is-danger"
        role="alert"
      >
        Please log in to search and add friends.
      </div>
    </div>
  </section>
</template>

<style scoped>
.search-results {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 2rem;
}

.user-card {
  width: 100%;
  margin: 0;
  padding: 2rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.user-details {
  flex: 1;
}

.user-image {
  width: 100px;
  height: 100px;
  min-width: 100px;
}

.user-actions {
  margin-left: auto;
}

@media (max-width: 768px) {
  .user-info {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .user-actions {
    margin-left: 0;
  }
}
</style>
