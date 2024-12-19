<script setup lang="ts">
import type { Meal } from '../models/meals.js'
import { getUserById, type UserSearchResult } from '../models/users.js'
import { api } from '../models/myFetch.js'
import type { DataEnvelope } from '../models/dataEnvelope.js'
import { ref, onMounted, watch } from 'vue'
import AutocompleteSearch from './AutocompleteSearch.vue'

interface Props {
  /** Meal data to display */
  meal: Meal
}

interface Emits {
  (e: 'edit', meal: Meal): void
  (e: 'delete', mealId: number): void
  (e: 'update', meal: Meal): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const taggedNames = ref<string[]>([])
const showTagInput = ref(false)
const selectedFriend = ref<UserSearchResult | null>(null)
const isLoading = ref(false)

const formatDate = (date: string): string => {
  try {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch (error) {
    return 'Invalid date'
  }
}

const handleEdit = () => {
  emit('edit', props.meal)
}

const handleDelete = () => {
  if (confirm('Are you sure you want to delete this meal?')) {
    emit('delete', props.meal.id)
  }
}

const handleFriendSelect = async () => {
  if (selectedFriend.value && !isLoading.value) {
    isLoading.value = true
    try {
      const response = await api<DataEnvelope<Meal>>(`meals/${props.meal.id}/tag/${selectedFriend.value.id}`, {}, 'POST')
      if (response.isSuccess && response.data) {
        emit('update', response.data)
        await loadTaggedFriends()
      }
    } catch (error) {
      console.error('Error tagging friend:', error)
    } finally {
      selectedFriend.value = null
      showTagInput.value = false
      isLoading.value = false
    }
  }
}

const handleUntagFriend = async (friendId: number) => {
  if (!isLoading.value) {
    isLoading.value = true
    try {
      const response = await api<DataEnvelope<Meal>>(`meals/${props.meal.id}/tag/${friendId}`, null, 'DELETE')
      if (response.isSuccess && response.data) {
        emit('update', response.data)
        await loadTaggedFriends()
      }
    } catch (error) {
      console.error('Error untagging friend:', error)
    } finally {
      isLoading.value = false
    }
  }
}

watch(() => selectedFriend.value, handleFriendSelect)

async function loadTaggedFriends() {
  if (props.meal.taggedFriends?.length) {
    const names = await Promise.all(
      props.meal.taggedFriends.map(async (id) => {
        const response = await getUserById(id)
        return response.isSuccess ? response.data.name : 'Unknown'
      })
    )
    taggedNames.value = names
  } else {
    taggedNames.value = []
  }
}

onMounted(loadTaggedFriends)
</script>

<template>
  <div 
    class="box meal-card has-background-dark has-text-light"
    role="article"
    aria-label="Meal entry"
  >
    <div class="meal-header">
      <h3 class="title is-5 has-text-light">{{ meal.name }}</h3>
      <span class="date has-text-grey-light">{{ formatDate(meal.date) }}</span>
    </div>

    <div class="meal-details">
      <p>
        <span class="icon has-text-info">
          <i class="fas fa-fire-alt"></i>
        </span>
        <strong>Calories:</strong> 
        {{ meal.mealCalories.toLocaleString() }} cal
      </p>

      <!-- Tagged Friends -->
      <div class="tagged-friends mt-2">
        <div class="detail-item">
          <span class="icon has-text-info">
            <i class="fas fa-users"></i>
          </span>
          <strong>Tagged Friends:</strong>
          <button 
            class="button is-small is-info is-light ml-2"
            @click="showTagInput = !showTagInput"
            :disabled="isLoading"
          >
            <span class="icon is-small">
              <i :class="showTagInput ? 'fas fa-minus' : 'fas fa-plus'"></i>
            </span>
          </button>
        </div>

        <!-- Tag Input -->
        <div v-if="showTagInput" class="mt-2 mb-2">
          <AutocompleteSearch
            v-model="selectedFriend"
            type="user"
            placeholder="Search for friends to tag..."
          />
        </div>

        <!-- Tagged Friends List -->
        <div v-if="meal.taggedFriends?.length" class="tags">
          <span 
            v-for="(name, index) in taggedNames" 
            :key="index" 
            class="tag is-info is-light"
          >
            {{ name }}
            <button 
              class="delete is-small" 
              @click="handleUntagFriend(meal.taggedFriends![index])"
              :disabled="isLoading"
            ></button>
          </span>
        </div>
      </div>
    </div>

    <div class="buttons mt-4">
      <button 
        class="button is-info is-small" 
        @click="handleEdit"
        title="Edit meal"
        aria-label="Edit meal"
      >
        <span class="icon">
          <i class="fas fa-edit"></i>
        </span>
        <span>Edit</span>
      </button>

      <button 
        class="button is-danger is-small" 
        @click="handleDelete"
        title="Delete meal"
        aria-label="Delete meal"
      >
        <span class="icon">
          <i class="fas fa-trash"></i>
        </span>
        <span>Delete</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.meal-card {
  margin-bottom: 1rem;
}

.meal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.meal-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tagged-friends {
  padding: 0.75rem;
  border-radius: 4px;
  background-color: #363636;
  border: 1px solid #4a4a4a;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.tag .delete {
  margin-left: 0.5rem;
}

.icon {
  width: 20px;
  display: flex;
  justify-content: center;
}
</style>
