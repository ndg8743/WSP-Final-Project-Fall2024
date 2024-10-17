<template>
    <div class="container">
      <h1 class="title">Leaderboard</h1>
      <div v-if="leaderboard.length">
        <table class="table is-fullwidth">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Name</th>
              <th>Total Workouts</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(user, index) in leaderboard" :key="user.id">
              <td>{{ index + 1 }}</td>
              <td>{{ user.name }}</td>
              <td>{{ user.totalWorkouts }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else>
        <p>No leaderboard data available.</p>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        leaderboard: [
          { id: 1, name: 'Alice', totalWorkouts: 50 },
          { id: 2, name: 'Bob', totalWorkouts: 45 },
          { id: 3, name: 'Charlie', totalWorkouts: 40 },
        ],
      };
    },
  };
  </script>
  
  <style scoped>
  .container {
    max-width: 600px;
    margin: 0 auto;
  }
  </style>
  