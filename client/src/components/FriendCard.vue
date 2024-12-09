<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { defineProps } from 'vue';
import defaultUserImage from '@/assets/User.jpg';
import { api } from '@/models/myFetch';

const props = defineProps({
  friendId: {
    type: Number,
    required: true,
  },
});

const friend = ref({
  name: '',
  exercise: 'No recent activity',
  calories: 0,
  image: defaultUserImage,
});
const router = useRouter();

onMounted(async () => {
  const session = localStorage.getItem('session');
  if (session) {
    const userId = JSON.parse(session).user.id;
    try {
      const response = await api(`friends/${userId}/activity/${props.friendId}`);
      if (response.isSuccess) {
        friend.value = {
          ...response.data,
          image: response.data.image || defaultUserImage,
        };
      } else {
        console.error('Failed to fetch friend data:', response.message);
        router.push('/login');
      }
    } catch (error) {
      console.error('Error fetching friend data:', error);
      router.push('/login');
    }
  } else {
    router.push('/login');
  }
});
</script>

<template>
  <div class="box" v-if="friend">
    <div class="user-info">
      <div class="user-image">
        <img :src="friend.image" alt="Friend image" />
      </div>
      <h2 class="subtitle">{{ friend.name }}'s Recent Activity</h2>
    </div>
    <p><strong>Activity:</strong> {{ friend.exercise }}</p>
    <p><strong>Calories Burned:</strong> {{ friend.calories }} kcal</p>
  </div>
</template>

<style scoped>
.box {
  margin-bottom: 15px;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-image {
  width: 50px;
  height: 50px;
  margin-right: 15px;
}

.user-image img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}
</style>
