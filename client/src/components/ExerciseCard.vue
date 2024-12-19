<script setup lang="ts">
import type { Exercise } from '../models/exercises.js'
import { getUserById, type UserSearchResult } from '../models/users.js'
import { api } from '../models/myFetch.js'
import type { DataEnvelope } from '../models/dataEnvelope.js'
import { ref, onMounted, watch } from 'vue'
import AutocompleteSearch from './AutocompleteSearch.vue'

interface Props {
  /** Exercise data to display */
  exercise: Exercise
}

interface Emits {
  (event: 'edit', exercise: Exercise): void
  (event: 'delete', id: number): void
  (event: 'update', exercise: Exercise): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const taggedNames = ref<string[]>([])
const showTagInput = ref(false)
const selectedFriend = ref<UserSearchResult | null>(null)
const isLoading = ref(false)

const handleDelete = () => {
  if (confirm('Are you sure you want to delete this exercise?')) {
    emit('delete', props.exercise.id)
  }
}

const handleFriendSelect = async () => {
  if (selectedFriend.value && !isLoading.value) {
    isLoading.value = true
    try {
      const response = await api<DataEnvelope<Exercise>>(`exercises/${props.exercise.id}/tag/${selectedFriend.value.id}`, {}, 'POST')
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
      const response = await api<DataEnvelope<Exercise>>(`exercises/${props.exercise.id}/tag/${friendId}`, null, 'DELETE')
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

const formatDate = (date: string): string => {
  try {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Invalid date'
  }
}

async function loadTaggedFriends() {
  if (props.exercise.taggedFriends?.length) {
    const names = await Promise.all(
      props.exercise.taggedFriends.map(async (id) => {
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
  <div class="box exercise-card has-background-dark has-text-light">
    <div class="exercise-header">
      <h3 class="title is-5 has-text-light">{{ exercise.name }}</h3>
      <div class="date has-text-grey-light">{{ formatDate(exercise.date) }}</div>
    </div>

    <div class="exercise-details">
      <div class="detail-item">
        <span class="icon">
          <i class="fas fa-clock"></i>
        </span>
        <span>{{ exercise.duration }} minutes</span>
      </div>

      <div class="detail-item">
        <span class="icon">
          <i class="fas fa-fire"></i>
        </span>
        <span>{{ exercise.caloriesBurned }} calories</span>
      </div>

      <!-- Tagged Friends -->
      <div class="tagged-friends mt-2">
        <div class="detail-item">
          <span class="icon">
            <i class="fas fa-users"></i>
          </span>
          <span>Tagged Friends:</span>
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
        <div v-if="exercise.taggedFriends?.length" class="tags ml-4 mt-2">
          <span 
            v-for="(name, index) in taggedNames" 
            :key="index" 
            class="tag is-info is-light"
          >
            {{ name }}
            <button 
              class="delete is-small" 
              @click="handleUntagFriend(exercise.taggedFriends![index])"
              :disabled="isLoading"
            ></button>
          </span>
        </div>
      </div>
    </div>

    <div class="buttons mt-4">
      <button 
        class="button is-info is-small" 
        @click="$emit('edit', exercise)"
        title="Edit exercise"
        aria-label="Edit exercise"
      >
        <span class="icon">
          <i class="fas fa-edit"></i>
        </span>
        <span>Edit</span>
      </button>

      <button 
        class="button is-danger is-small" 
        @click="handleDelete"
        title="Delete exercise"
        aria-label="Delete exercise"
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
.exercise-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.exercise-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.icon {
  width: 20px;
  display: flex;
  justify-content: center;
}

.tagged-friends {
  padding: 0.75rem;
  border-radius: 4px;
  background-color: #363636;
  border: 1px solid #4a4a4a;
}

.tagged-friends .tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.tag .delete {
  margin-left: 0.5rem;
}
</style>
