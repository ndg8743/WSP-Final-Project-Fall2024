<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
interface Emits {
  (event: 'close'): void
}

defineEmits<Emits>()
</script>

<template>
  <div 
    class="modal is-active"
    role="dialog"
    aria-modal="true"
  >
    <div 
      class="modal-background" 
      @click="$emit('close')"
      role="button"
      aria-label="Close modal"
    ></div>
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">
          <slot name="header"></slot>
        </p>
        <button 
          class="delete" 
          aria-label="close" 
          @click="$emit('close')"
        ></button>
      </header>
      <section class="modal-card-body">
        <slot name="body"></slot>
      </section>
      <footer class="modal-card-foot">
        <slot name="footer"></slot>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.modal-card-head,
.modal-card-foot {
  justify-content: space-between;
}
</style>
