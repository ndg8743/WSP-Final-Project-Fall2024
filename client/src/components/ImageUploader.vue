<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { ref, defineProps, defineEmits } from 'vue';

// Props to customize the label and receive the image
const props = defineProps({
  label: {
    type: String,
    default: 'Upload Image'
  },
  image: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:image']);
const imageSrc = ref(props.image);

const uploadImage = (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      imageSrc.value = e.target.result;
      emit('update:image', imageSrc.value); 
    };
    reader.readAsDataURL(file);
  }
};
</script>

<template>
    <div class="field">
      <label class="label">{{ label }}</label>
      <div class="control">
        <input type="file" @change="uploadImage" />
      </div>
      <figure class="image is-128x128" v-if="imageSrc">
        <img :src="imageSrc" alt="Uploaded Image" />
      </figure>
    </div>
  </template>
  
  <style scoped>
  .image {
    margin-top: 10px;
  }
  </style>
  
