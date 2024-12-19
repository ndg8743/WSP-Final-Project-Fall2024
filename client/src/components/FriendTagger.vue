<template>
  <div class="friend-tagger">
    <o-autocomplete
      v-model="searchQuery"
      :data="suggestions"
      field="name"
      :loading="isLoading"
      :debounce="300"
      expanded
      clearable
      @typing="onSearch"
      @select="onSelect"
      class="has-background-dark"
    >
      <template #item="{ option }">
        <div class="media has-background-dark has-text-light">
          <div class="media-left">
            <img 
              :src="option.image || '/src/assets/User.jpg'" 
              class="image is-32x32"
              alt="User avatar"
            >
          </div>
          <div class="media-content">
            <div>{{ option.name }}</div>
            <small class="has-text-grey-light">{{ option.email }}</small>
          </div>
        </div>
      </template>
    </o-autocomplete>

    <!-- Display tagged friends -->
    <div class="tags mt-2">
      <span v-for="friend in taggedFriends" :key="friend.id" class="tag is-info is-medium">
        {{ friend.name }}
        <button class="delete is-small" @click="removeTag(friend)"></button>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { searchUsers, type UserSearchResult } from '../models/users'

const props = defineProps<{
  modelValue: UserSearchResult[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: UserSearchResult[]): void
}>()

const searchQuery = ref('')
const suggestions = ref<UserSearchResult[]>([])
const isLoading = ref(false)
const taggedFriends = ref<UserSearchResult[]>(props.modelValue || [])

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue) => {
  taggedFriends.value = newValue || []
})

// Watch for internal changes to taggedFriends
watch(taggedFriends, (newValue) => {
  emit('update:modelValue', newValue)
}, { deep: true })

async function onSearch(query: string) {
  if (!query) {
    suggestions.value = []
    return
  }

  isLoading.value = true
  try {
    const response = await searchUsers(query)
    if (response.isSuccess) {
      // Filter out already tagged friends
      suggestions.value = response.data.filter(
        user => !taggedFriends.value.some(tagged => tagged.id === user.id)
      )
    }
  } catch (error) {
    console.error('Error searching users:', error)
    suggestions.value = []
  } finally {
    isLoading.value = false
  }
}

function onSelect(option: UserSearchResult | null) {
  if (option && !taggedFriends.value.some(friend => friend.id === option.id)) {
    taggedFriends.value.push(option)
    searchQuery.value = '' // Clear the input after selection
  }
}

function removeTag(friend: UserSearchResult) {
  taggedFriends.value = taggedFriends.value.filter(f => f.id !== friend.id)
}
</script>

<style scoped>
.friend-tagger {
  width: 100%;
}

.media {
  align-items: center;
  padding: 0.25rem;
}

.media-left {
  margin-right: 0.75rem;
}

.media-content {
  overflow: hidden;
}

.media-content small {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tags {
  margin-top: 0.5rem;
}

.tag {
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
}

:deep(.o-acp) {
  background-color: #363636;
  color: #fff;
  border-color: #4a4a4a;
}

:deep(.o-acp__menu) {
  background-color: #363636;
  border-color: #4a4a4a;
}

:deep(.o-acp__menu-option) {
  color: #fff;
}

:deep(.o-acp__menu-option--selected),
:deep(.o-acp__menu-option:hover) {
  background-color: #4a4a4a;
}

:deep(.o-acp__input) {
  background-color: #363636;
  color: #fff;
  border-color: #4a4a4a;
}

:deep(.o-acp__input::placeholder) {
  color: #b5b5b5;
}

:deep(.o-acp__input:focus) {
  border-color: #485fc7;
}
</style>
