<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { User } from '@/models/user' // Import User type if necessary

const avatar = ref('')
const currentUser = ref<User | null>(null)

onMounted(() => {
  // Load the logged-in user data from localStorage
  const session = localStorage.getItem('session')
  if (session) {
    currentUser.value = JSON.parse(session)
    avatar.value = currentUser.value?.image || '' // Set avatar to the user's current image if available
  }
})

const uploadImage = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      avatar.value = e.target?.result as string

      // Update the current user's avatar
      if (currentUser.value) {
        currentUser.value.image = avatar.value
        // Save the updated user data to localStorage
        localStorage.setItem('session', JSON.stringify(currentUser.value))
      }
    }
    reader.readAsDataURL(file)
  }
}
</script>

<template>
  <div class="field">
    <label class="label">Upload Avatar</label>
    <div class="control">
      <input type="file" @change="uploadImage" />
    </div>
    <figure class="image is-128x128" v-if="avatar">
      <img :src="avatar" alt="User Avatar" />
    </figure>
  </div>
</template>

<style scoped>
.image {
  margin-top: 10px;
}
</style>
