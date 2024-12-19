<template>
  <div class="autocomplete-search">
    <o-autocomplete
      v-model="searchQuery"
      :data="suggestions"
      field="name"
      :loading="isLoading"
      :debounce="300"
      expanded
      clearable
      :clear-icon="false"
      keep-first
      open-on-focus
      :custom-class="{
        'has-background-dark': true,
        'has-text-light': true,
        'input': true
      }"
      @typing="onSearch"
      @select="onSelect"
      @keydown.tab.prevent="handleTab"
    >
      <template #item="{ option }">
        <!-- User search item -->
        <template v-if="type === 'user' && isUserResult(option)">
          <div class="media">
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

        <!-- Exercise search item -->
        <template v-else-if="type === 'exercise' && isExerciseResult(option)">
          <div class="media">
            <div class="media-content">
              <div>{{ option.name }}</div>
              <small class="has-text-grey-light">
                {{ option.duration }} mins | {{ option.caloriesBurned }} calories
              </small>
            </div>
          </div>
        </template>

        <!-- Meal search item -->
        <template v-else-if="type === 'meal' && isMealResult(option)">
          <div class="media">
            <div class="media-content">
              <div>{{ option.name }}</div>
              <small class="has-text-grey-light">
                {{ option.mealCalories }} calories
              </small>
            </div>
          </div>
        </template>
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

// Type guards
function isUserResult(result: SearchResult): result is UserSearchResult {
  return 'email' in result
}

function isExerciseResult(result: SearchResult): result is Exercise {
  return 'duration' in result && 'caloriesBurned' in result
}

function isMealResult(result: SearchResult): result is Meal {
  return 'mealCalories' in result
}

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue) => {
  if (newValue?.name) {
    searchQuery.value = newValue.name
  }
})

async function onSearch(query: string) {
  if (!query.trim()) {
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

function handleTab(event: KeyboardEvent) {
  if (suggestions.value.length > 0) {
    onSelect(suggestions.value[0])
  }
}

function onSelect(option: SearchResult) {
  if (isUserResult(option)) {
    emit('update:modelValue', option)
  } else if (isExerciseResult(option)) {
    emit('update:modelValue', {
      name: option.name,
      duration: option.duration,
      caloriesBurned: option.caloriesBurned
    })
  } else if (isMealResult(option)) {
    emit('update:modelValue', {
      name: option.name,
      mealCalories: option.mealCalories
    })
  }
  searchQuery.value = option.name
}
</script>

<style scoped>
.autocomplete-search {
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
  background-color: #363636 !important;
  color: #fff !important;
  border-color: #4a4a4a !important;
}

:deep(.o-acp__input::placeholder) {
  color: #b5b5b5;
}

:deep(.o-acp__input:focus) {
  border-color: #485fc7 !important;
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
