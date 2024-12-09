<script setup>
import { ref, onMounted } from 'vue';
import FriendActivityCard from '@/components/FriendActivityCard.vue';
import { api } from '@/models/myFetch';

const session = localStorage.getItem('session');
const currentUser = session ? JSON.parse(session).users : null;

const friendsActivities = ref([]);
const loading = ref(true);
const error = ref('');

async function getMostRecentActivity(userId) {
  try {
    const response = await api(`exercises?userId=${userId}`);
    if (response.isSuccess && response.data?.length) {
      const recentActivity = response.data.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
      return { name: recentActivity.name, caloriesBurned: recentActivity.calories };
    }
    return { name: 'No recent activity', caloriesBurned: 0 };
  } catch (err) {
    console.error(`Error fetching activities for user ${userId}:`, err);
    return { name: 'Error fetching activity', caloriesBurned: 0 };
  }
}

async function getLastMeal(userId) {
  try {
    const response = await api(`meals?userId=${userId}`);
    if (response.isSuccess && response.data?.length) {
      const lastMeal = response.data.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
      return { name: lastMeal.name, calories: lastMeal.calories || 0 };
    }
    return { name: 'No meal recorded', calories: 0 };
  } catch (err) {
    console.error(`Error fetching meals for user ${userId}:`, err);
    return { name: 'Error fetching meal', calories: 0 };
  }
}

onMounted(async () => {
  if (!currentUser) {
    error.value = 'Please log in to view social activities.';
    loading.value = false;
    return;
  }

  console.log('Fetching friends activities for user:', currentUser.id);
  try {
    const friends =
      currentUser.role === 'admin'
        ? (await api('users')).data || []
        : currentUser.friends.map((id) => ({ id }));

    friendsActivities.value = await Promise.all(
      friends.map(async (friend) => {
        const recentActivity = await getMostRecentActivity(friend.id);
        const lastMeal = await getLastMeal(friend.id);
        return {
          id: friend.id,
          name: friend.name || 'Unknown Friend',
          image: friend.image || '/assets/User.jpg',
          exercise: recentActivity.name,
          caloriesBurned: recentActivity.caloriesBurned,
          lastMeal: lastMeal.name,
          mealCalories: lastMeal.calories,
        };
      })
    );
    console.log('Friends activities fetched:', friendsActivities.value);
  } catch (err) {
    console.error('Error fetching friends activities:', err);
    error.value = 'Failed to load social data. Please try again later.';
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <section class="section">
    <div class="container">
      <h1 class="title">Social</h1>
      <div v-if="loading">
        <p>Loading...</p>
      </div>
      <div v-else-if="error">
        <p class="notification is-danger">{{ error }}</p>
      </div>
      <div v-else>
        <FriendActivityCard v-for="friend in friendsActivities" :key="friend.id" :friend="friend" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.section {
  padding-top: 2rem;
}

.notification {
  margin-top: 1rem;
}
</style>
