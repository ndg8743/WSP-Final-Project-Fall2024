<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
//import { Users } from '@/models/users.js' // Import User type if necessary
import { getSession } from '@/models/login';

const avatar = ref('')
const session = getSession()

onMounted(() => {
  if (session.user) {
    avatar.value = session.user.image || '' // Set avatar to the user's current image if available
  }
})

const uploadImage = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      avatar.value = e.target?.result as string

      // Update the current user's avatar
      if (session.user) {
        session.user.image = avatar.value
        // Save the updated user data to localStorage
        localStorage.setItem('session', JSON.stringify(session))
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
