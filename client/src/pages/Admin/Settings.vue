<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { ref, watch, onMounted } from 'vue'

// Set initial theme to dark if no theme is saved in localStorage
const settings = ref({
  theme: localStorage.getItem('theme') || 'dark',
  emailNotifications: true
})

const saveMessage = ref('')

// Function to apply the theme
const applyTheme = () => {
  document.documentElement.classList.remove('light', 'dark')
  document.documentElement.classList.add(settings.value.theme)
}

// Save the theme and apply it
const saveSettings = () => {
  localStorage.setItem('theme', settings.value.theme)
  applyTheme()
  saveMessage.value = 'Settings have been successfully saved!'
}

// Apply the theme on initial load
onMounted(() => {
  applyTheme() // Ensure dark mode by default on page load
})

// Watch theme changes and apply immediately
watch(
  () => settings.value.theme,
  () => applyTheme(),
  { immediate: true }
)
</script>

<template>
  <section class="section">
    <div class="container">
      <h1 class="title">App Settings</h1>

      <div class="field">
        <label class="label">Theme</label>
        <div class="control">
          <div class="select">
            <select v-model="settings.theme">
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
          </div>
        </div>
      </div>

      <div class="field">
        <label class="label">Email Notifications</label>
        <div class="control">
          <input type="checkbox" v-model="settings.emailNotifications" />
          <span>Enable email notifications</span>
        </div>
      </div>

      <button class="button is-primary" @click="saveSettings">Save Settings</button>

      <div class="box" v-if="saveMessage">
        <p>{{ saveMessage }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.section {
  padding-top: 2rem;
}
</style>
