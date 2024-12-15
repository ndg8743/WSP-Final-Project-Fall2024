<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  /** Label for the image upload field */
  label?: string
  /** Current image value (data URL) */
  image?: string
  /** Accepted file types (e.g., 'image/jpeg,image/png') */
  accept?: string
  /** Maximum file size in bytes */
  maxSize?: number
}

interface Emits {
  (event: 'update:image', value: string): void
  (event: 'error', message: string): void
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Upload Image',
  image: '',
  accept: 'image/*',
  maxSize: 5 * 1024 * 1024 // 5MB default
})

const emit = defineEmits<Emits>()
const imageSrc = ref<string>(props.image)
const error = ref<string>('')
const isLoading = ref<boolean>(false)

const validateFile = (file: File): boolean => {
  try {
    // Check file type
    if (!file.type.startsWith('image/')) {
      throw new Error('Please upload an image file')
    }

    // Check file size
    if (file.size > props.maxSize) {
      const maxSizeMB = props.maxSize / (1024 * 1024)
      throw new Error(`File size should not exceed ${maxSizeMB}MB`)
    }

    error.value = ''
    return true
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid file'
    error.value = message
    emit('error', message)
    return false
  }
}

const handleFileRead = (reader: FileReader, input: HTMLInputElement) => {
  try {
    const result = reader.result
    if (typeof result === 'string') {
      imageSrc.value = result
      emit('update:image', result)
    } else {
      throw new Error('Invalid file data')
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to process file'
    error.value = message
    emit('error', message)
    input.value = '' // Reset input
  } finally {
    isLoading.value = false
  }
}

const uploadImage = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  
  if (!file) {
    error.value = 'No file selected'
    emit('error', 'No file selected')
    return
  }

  if (!validateFile(file)) {
    input.value = '' // Reset input
    return
  }

  isLoading.value = true
  error.value = ''

  const reader = new FileReader()
  
  reader.onload = () => handleFileRead(reader, input)

  reader.onerror = () => {
    error.value = 'Failed to read file'
    emit('error', 'Failed to read file')
    isLoading.value = false
    input.value = '' // Reset input
  }

  try {
    reader.readAsDataURL(file)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to read file'
    error.value = message
    emit('error', message)
    isLoading.value = false
    input.value = ''
  }
}
</script>

<template>
  <div class="field">
    <label class="label">{{ label }}</label>
    
    <div 
      v-if="error" 
      class="notification is-danger is-light"
      role="alert"
    >
      {{ error }}
    </div>

    <div class="file has-name">
      <label class="file-label">
        <input 
          class="file-input" 
          type="file" 
          :accept="accept"
          @change="uploadImage"
          :disabled="isLoading"
          :aria-label="label"
        >
        <span class="file-cta">
          <span class="file-icon">
            <i class="fas fa-upload"></i>
          </span>
          <span class="file-label">
            {{ isLoading ? 'Loading...' : 'Choose a file' }}
          </span>
        </span>
      </label>
    </div>

    <div 
      v-if="imageSrc" 
      class="image-preview mt-4"
      role="img"
      aria-label="Image preview"
    >
      <figure class="image is-128x128">
        <img 
          :src="imageSrc" 
          alt="Uploaded Image"
          class="preview-image"
        />
      </figure>
    </div>
  </div>
</template>

<style scoped>
.image-preview {
  position: relative;
  display: inline-block;
}
</style>
