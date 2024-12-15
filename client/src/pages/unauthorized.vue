<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <section class="section">
    <div class="container">
      <div class="box has-text-centered">
        <h1 class="title has-text-danger">Access Denied</h1>
        <p class="subtitle">You must be an admin to use this page.</p>
        <div class="buttons is-centered mt-4">
          <router-link to="/" class="button is-primary">Return to Dashboard</router-link>
          <button @click="router.back()" class="button">Go Back</button>
        </div>
      </div>
    </div>
  </section>
</template>
