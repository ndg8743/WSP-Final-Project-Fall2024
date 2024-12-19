<template>
  <div class="typeahead">
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
          <!-- User search item -->
          <template v-if="type === 'user'">
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
          </template>

          <!-- Exercise search item -->
          <template v-else-if="type === 'exercise'">
            <div class="media-content">
              <div>{{ option.name }}</div>
              <small class="has-text-grey-light">
                {{ option.duration }} mins | {{ option.caloriesBurned }} calories
              </small>
            </div>
          </template>

          <!-- Meal search item -->
          <template v-else-if="type === 'meal'">
            <div class="media-content">
              <div>{{ option.name }}</div>
              <small class="has-text-grey-light">
                {{ option.mealCalories }} calories
              </small>
            </div>
          </template>
        </div>
      </template>
    </o-autocomplete>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { searchUsers, type UserSearchResult } from '../models/users'
import { searchExercises, type Exercise } from '../models/exercises'
import { searchMeals, type Meal } from '../models/meals'

type SearchType = 'user' | 'exercise' | 'meal'
type SearchResult = UserSearchResult | Exercise | Meal

interface Props {
  modelValue: any
  type: SearchType
  placeholder?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void
}>()

const searchQuery = ref('')
const suggestions = ref<SearchResult[]>([])
const isLoading = ref(false)

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue) => {
  if (newValue?.name) {
    searchQuery.value = newValue.name
  }
})

async function onSearch(query: string) {
  if (!query) {
    suggestions.value = []
    return
  }

  isLoading.value = true
  try {
    let response
    switch (props.type) {
      case 'user':
        response = await searchUsers(query)
        break
      case 'exercise':
        response = await searchExercises(query)
        break
      case 'meal':
        response = await searchMeals(query)
        break
    }

    if (response?.isSuccess) {
      suggestions.value = response.data
    }
  } catch (error) {
    console.error('Error searching:', error)
    suggestions.value = []
  } finally {
    isLoading.value = false
  }
}

function onSelect(option: SearchResult | null) {
  if (option) {
    switch (props.type) {
      case 'user':
        emit('update:modelValue', option)
        break
      case 'exercise':
        emit('update:modelValue', {
          name: option.name,
          duration: (option as Exercise).duration,
          caloriesBurned: (option as Exercise).caloriesBurned
        })
        break
      case 'meal':
        emit('update:modelValue', {
          name: option.name,
          mealCalories: (option as Meal).mealCalories
        })
        break
    }
  }
  searchQuery.value = option?.name || ''
}
</script>

<style scoped>
.typeahead {
  width: 100%;
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

.image.is-32x32 {
  border-radius: 50%;
}
</style>
