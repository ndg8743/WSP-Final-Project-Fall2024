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
  
  <script setup>
  import { ref } from 'vue';
  
  const avatar = ref('');
  
  const uploadImage = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        avatar.value = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };
  </script>
  
  <style scoped>
  .image {
    margin-top: 10px;
  }
  </style>
  