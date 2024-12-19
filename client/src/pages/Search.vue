<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { addFriend, removeFriend, searchUsers, type UserSearchResult } from '../models/users'
import { getSession } from '../models/login'
import AutocompleteSearch from '../components/AutocompleteSearch.vue'

const router = useRouter()
const session = getSession()

// Validate session before proceeding
if (!session.token || !session.user?.id) {
  router.push('/login')
}

const selectedUser = ref<UserSearchResult | null>(null)
const friends = ref<number[]>(
  Array.isArray(session.user?.friends) ? session.user.friends : []
)
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
</script>

<template>
  <section class="section">
    <div class="container">
      <h1 class="title is-2">Search Users</h1>
      
      <div v-if="session.token && session.user">
        <div class="field">
          <div class="control">
            <AutocompleteSearch
              v-model="selectedUser"
              type="user"
              placeholder="Search for users..."
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
          v-else-if="selectedUser" 
          class="box user-card has-background-dark has-text-light mt-4"
          role="listitem"
        >
          <div class="user-info">
            <div 
              class="user-image"
              role="img"
              :aria-label="`${selectedUser.name}'s profile picture`"
            >
              <img 
                :src="selectedUser.image || '/src/assets/User.jpg'" 
                :alt="`${selectedUser.name}'s profile picture`"
              >
            </div>
            <div class="user-details">
              <p class="title is-4 has-text-light">{{ selectedUser.name }}</p>
              <p class="subtitle is-5 has-text-grey-light">{{ selectedUser.email }}</p>
            </div>
            <div class="user-actions">
              <button 
                v-if="!friends.includes(selectedUser.id)" 
                class="button is-primary is-medium"
                :class="{ 'is-loading': isLoading }"
                :disabled="isLoading"
                @click="handleAddFriend(selectedUser.id)"
                :aria-label="`Add ${selectedUser.name} as friend`"
              >
                Add Friend
              </button>
              <button 
                v-else 
                class="button is-danger is-medium"
                :class="{ 'is-loading': isLoading }"
                :disabled="isLoading"
                @click="handleRemoveFriend(selectedUser.id)"
                :aria-label="`Remove ${selectedUser.name} from friends`"
              >
                Remove Friend
              </button>
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
.user-card {
  width: 100%;
  margin: 0;
  padding: 2rem;
  border: 1px solid #4a4a4a;
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

.user-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
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
