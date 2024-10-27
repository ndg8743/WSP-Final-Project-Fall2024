<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
  import { ref } from 'vue';

  // Mock settings data
  const settings = ref({
    theme: 'light',
    emailNotifications: true
  });

  const saveMessage = ref('');

  const saveSettings = () => {
    // Simulate a save process
    saveMessage.value = 'Settings have been successfully saved!';
  };
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
              <option value="light">Light</option>
              <option value="dark">Dark</option>
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