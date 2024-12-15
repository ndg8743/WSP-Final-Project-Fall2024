<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getSession } from '../models/login'
import { updateUser, type User } from '../models/users'

interface Session {
  token: string
  user: {
    id: number
    name: string
    email: string
    image?: string
    [key: string]: any
  }
}

const router = useRouter()
const session = getSession() as Session
const avatar = ref('')
const name = ref('')
const email = ref('')
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const isEditing = ref(false)
const message = ref('')
const messageType = ref('')
const theme = ref(localStorage.getItem('theme') || 'dark')

// Validate session
if (!session?.token || !session?.user?.id) {
  router.push('/login')
}

// Apply theme function
const applyTheme = () => {
  document.documentElement.classList.remove('light', 'dark')
  document.documentElement.classList.add(theme.value)
}

// Watch theme changes and apply immediately
watch(() => theme.value, () => {
  localStorage.setItem('theme', theme.value)
  applyTheme()
})

onMounted(() => {
  if (session.user) {
    avatar.value = session.user.image || ''
    name.value = session.user.name
    email.value = session.user.email
  }
  applyTheme()
})

const uploadImage = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  // Validate file type
  if (!file.type.startsWith('image/')) {
    message.value = 'Please upload an image file'
    messageType.value = 'is-danger'
    return
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    message.value = 'Image size should be less than 5MB'
    messageType.value = 'is-danger'
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const result = e.target?.result
      if (typeof result === 'string') {
        avatar.value = result
        if (session.user) {
          session.user.image = avatar.value
          localStorage.setItem('session', JSON.stringify(session))
          saveChanges()
        }
      }
    } catch (err) {
      message.value = 'Failed to process image'
      messageType.value = 'is-danger'
    }
  }
  reader.onerror = () => {
    message.value = 'Failed to read image file'
    messageType.value = 'is-danger'
  }
  reader.readAsDataURL(file)
}

const saveChanges = async () => {
  if (!session.user?.id) {
    router.push('/login')
    return
  }

  try {
    const updates: Partial<User> = {
      name: name.value,
      email: email.value,
      image: avatar.value
    }

    if (newPassword.value) {
      if (newPassword.value !== confirmPassword.value) {
        message.value = 'New passwords do not match'
        messageType.value = 'is-danger'
        return
      }
      if (newPassword.value.length < 6) {
        message.value = 'Password must be at least 6 characters'
        messageType.value = 'is-danger'
        return
      }
      updates.password = newPassword.value
    }

    const response = await updateUser(session.user.id, updates)
    
    if (response.isSuccess) {
      message.value = 'Profile updated successfully'
      messageType.value = 'is-success'
      isEditing.value = false
      
      // Update session
      if (session.user) {
        session.user.name = name.value
        session.user.email = email.value
        session.user.image = avatar.value
        localStorage.setItem('session', JSON.stringify(session))
      }

      // Clear password fields
      currentPassword.value = ''
      newPassword.value = ''
      confirmPassword.value = ''
    } else {
      throw new Error(response.message || 'Failed to update profile')
    }
  } catch (err) {
    message.value = err instanceof Error ? err.message : 'Failed to update profile'
    messageType.value = 'is-danger'
    
    if (err instanceof Error && err.message === 'Session expired') {
      router.push('/login')
    }
  }
}
</script>

<template>
  <div class="profile-container">
    <div class="box profile-box mt-6">
      <h1 class="title is-3">Profile Settings</h1>
      
      <!-- Profile Image Section -->
      <div class="columns is-vcentered mb-5">
        <div class="column is-narrow">
          <figure 
            class="image is-128x128 avatar-container"
            role="img"
            :aria-label="name ? `${name}'s profile picture` : 'Profile picture'"
          >
            <img 
              :src="avatar || '/src/assets/User.jpg'" 
              :alt="name ? `${name}'s profile picture` : 'Profile picture'"
              class="is-rounded profile-image" 
            />
          </figure>
        </div>
        <div class="column">
          <div class="file has-text-centered">
            <label class="file-label">
              <input 
                class="file-input" 
                type="file" 
                @change="uploadImage" 
                accept="image/*"
                aria-label="Upload profile picture"
              >
              <span class="file-cta">
                <span class="file-label">
                  Choose a new photo
                </span>
              </span>
            </label>
          </div>
        </div>
      </div>

      <!-- Alert Message -->
      <div 
        v-if="message" 
        :class="['notification', messageType, 'fade-in']"
        role="alert"
      >
        {{ message }}
      </div>

      <!-- App Settings Section -->
      <div class="settings-section mb-5">
        <h2 class="title is-5">App Settings</h2>
        <div class="field">
          <label class="label" for="themeSelect">Theme</label>
          <div class="control">
            <div class="select">
              <select 
                id="themeSelect"
                v-model="theme"
                aria-label="Select theme"
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Profile Information Form -->
      <form 
        @submit.prevent="saveChanges" 
        class="profile-form"
        aria-label="Profile settings form"
      >
        <div class="field">
          <label class="label" for="nameInput">Name</label>
          <div class="control">
            <input 
              id="nameInput"
              class="input" 
              type="text" 
              v-model="name" 
              :disabled="!isEditing"
              required
              aria-required="true"
            >
          </div>
        </div>

        <div class="field">
          <label class="label" for="emailInput">Email</label>
          <div class="control">
            <input 
              id="emailInput"
              class="input" 
              type="email" 
              v-model="email" 
              :disabled="!isEditing"
              required
              aria-required="true"
            >
          </div>
        </div>

        <!-- Password Change Section (Only visible when editing) -->
        <div 
          v-if="isEditing" 
          class="password-section mt-5 fade-in"
          aria-label="Change password section"
        >
          <h2 class="title is-5">Change Password</h2>
          
          <div class="field">
            <label class="label" for="currentPassword">Current Password</label>
            <div class="control">
              <input 
                id="currentPassword"
                class="input" 
                type="password" 
                v-model="currentPassword"
                placeholder="Enter current password"
                autocomplete="current-password"
              >
            </div>
          </div>

          <div class="field">
            <label class="label" for="newPassword">New Password</label>
            <div class="control">
              <input 
                id="newPassword"
                class="input" 
                type="password" 
                v-model="newPassword"
                placeholder="Enter new password"
                autocomplete="new-password"
              >
            </div>
          </div>

          <div class="field">
            <label class="label" for="confirmPassword">Confirm New Password</label>
            <div class="control">
              <input 
                id="confirmPassword"
                class="input" 
                type="password" 
                v-model="confirmPassword"
                placeholder="Confirm new password"
                autocomplete="new-password"
              >
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="field is-grouped mt-5">
          <div class="control">
            <button 
              v-if="!isEditing" 
              type="button" 
              class="button is-primary"
              @click="isEditing = true"
              aria-label="Edit profile"
            >
              Edit Profile
            </button>
            <button 
              v-else 
              type="submit" 
              class="button is-success"
              aria-label="Save changes"
            >
              Save Changes
            </button>
          </div>
          <div class="control" v-if="isEditing">
            <button 
              type="button" 
              class="button is-light"
              @click="isEditing = false"
              aria-label="Cancel editing"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>
