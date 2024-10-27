<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  user: {
    type: Object,
    required: true,
  }
});

const emit = defineEmits(['edit-user', 'delete-user']);

const editUser = () => {
  emit('edit-user', props.user);
};

const deleteUser = () => {
  emit('delete-user', props.user.id);
};
</script>

<template>
    <tr>
      <td>{{ user.name }}</td>
      <td>{{ user.email }}</td>
      <td>{{ user.role }}</td>
      <td>
        <button class="button is-small is-info" @click="editUser">Edit</button>
        <button class="button is-small is-danger" @click="deleteUser">Delete</button>
      </td>
    </tr>
  </template>
  
  <style scoped>
  .button {
    margin-right: 5px;
  }
  </style>
  