<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getSession } from '../models/login'
import { updateUser, type User } from '../models/users'

const avatar = ref('')
const session = getSession()
const name = ref('')
const email = ref('')
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const isEditing = ref(false)
const message = ref('')
const messageType = ref('')

onMounted(() => {
  if (session.user) {
    avatar.value = session.user.image || ''
    name.value = session.user.name
    email.value = session.user.email
  }
})

const uploadImage = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      avatar.value = e.target?.result as string
      if (session.user) {
        session.user.image = avatar.value
        localStorage.setItem('session', JSON.stringify(session))
        saveChanges()
      }
    }
    reader.readAsDataURL(file)
  }
}

const saveChanges = async () => {
  if (!session.user?.id) return

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
      message.value = response.message || 'Failed to update profile'
      messageType.value = 'is-danger'
    }
  } catch (error) {
    message.value = 'An error occurred while updating profile'
    messageType.value = 'is-danger'
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
          <figure class="image is-128x128 avatar-container">
            <img :src="avatar || '/src/assets/User.jpg'" alt="User Avatar" class="is-rounded profile-image" />
          </figure>
        </div>
        <div class="column">
          <div class="file has-text-centered">
            <label class="file-label">
              <input class="file-input" type="file" @change="uploadImage" accept="image/*">
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
      <div v-if="message" :class="['notification', messageType, 'fade-in']">
        {{ message }}
      </div>

      <!-- Profile Information Form -->
      <form @submit.prevent="saveChanges" class="profile-form">
        <div class="field">
          <label class="label">Name</label>
          <div class="control">
            <input 
              class="input" 
              type="text" 
              v-model="name" 
              :disabled="!isEditing"
              required
            >
          </div>
        </div>

        <div class="field">
          <label class="label">Email</label>
          <div class="control">
            <input 
              class="input" 
              type="email" 
              v-model="email" 
              :disabled="!isEditing"
              required
            >
          </div>
        </div>

        <!-- Password Change Section (Only visible when editing) -->
        <div v-if="isEditing" class="password-section mt-5 fade-in">
          <h3 class="title is-5">Change Password</h3>
          
          <div class="field">
            <label class="label">Current Password</label>
            <div class="control">
              <input 
                class="input" 
                type="password" 
                v-model="currentPassword"
                placeholder="Enter current password"
              >
            </div>
          </div>

          <div class="field">
            <label class="label">New Password</label>
            <div class="control">
              <input 
                class="input" 
                type="password" 
                v-model="newPassword"
                placeholder="Enter new password"
              >
            </div>
          </div>

          <div class="field">
            <label class="label">Confirm New Password</label>
            <div class="control">
              <input 
                class="input" 
                type="password" 
                v-model="confirmPassword"
                placeholder="Confirm new password"
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
            >
              Edit Profile
            </button>
            <button 
              v-else 
              type="submit" 
              class="button is-success"
            >
              Save Changes
            </button>
          </div>
          <div class="control" v-if="isEditing">
            <button 
              type="button" 
              class="button is-light"
              @click="isEditing = false"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.profile-container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.profile-box {
  transition: all 0.3s ease;
}

.profile-box:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.avatar-container {
  margin: 0 auto;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.avatar-container:hover {
  transform: scale(1.05);
}

.profile-image {
  object-fit: cover;
  width: 100%;
  height: 100%;
}

.password-section {
  border-top: 1px solid var(--border-color, #dbdbdb);
  padding-top: 1.5rem;
}

.file {
  justify-content: center;
  margin-top: 1rem;
}

.notification {
  margin-bottom: 1.5rem;
}

.profile-form .field {
  transition: opacity 0.3s ease;
}

.fade-in {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Dark mode specific styles */
:global(html.dark) .profile-box {
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
}

:global(html.dark) .avatar-container {
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.4);
}

:global(html.dark) .password-section {
  border-color: #333;
}
</style>
