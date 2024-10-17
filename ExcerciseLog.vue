<template>
    <div class="container">
      <h1 class="title">Exercise Log</h1>
      <form @submit.prevent="logExercise">
        <div class="field">
          <label class="label">Date</label>
          <div class="control">
            <input class="input" type="date" v-model="date" />
          </div>
        </div>
  
        <div class="field">
          <label class="label">Exercise Type</label>
          <div class="control">
            <div class="select">
              <select v-model="exerciseType">
                <option>Running</option>
                <option>Cycling</option>
                <option>Swimming</option>
                <option>Weightlifting</option>
              </select>
            </div>
          </div>
        </div>
  
        <div class="field">
          <label class="label">Duration (minutes)</label>
          <div class="control">
            <input class="input" type="number" v-model="duration" placeholder="Enter duration" />
          </div>
        </div>
  
        <div class="control">
          <button class="button is-primary" type="submit">Log Exercise</button>
        </div>
      </form>
  
      <div class="exercise-list" v-if="exercises.length">
        <h2 class="subtitle">Exercise History</h2>
        <ul>
          <li v-for="exercise in exercises" :key="exercise.id">
            {{ exercise.date }} - {{ exercise.type }} - {{ exercise.duration }} mins
          </li>
        </ul>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        date: '',
        exerciseType: 'Running',
        duration: '',
        exercises: [],
      };
    },
    methods: {
      logExercise() {
        // Log the exercise (store in a local array for now)
        this.exercises.push({
          id: Date.now(),
          date: this.date,
          type: this.exerciseType,
          duration: this.duration,
        });
        this.clearForm();
      },
      clearForm() {
        this.date = '';
        this.duration = '';
        this.exerciseType = 'Running';
      },
    },
  };
  </script>
  
  <style scoped>
  .container {
    max-width: 600px;
    margin: 0 auto;
  }
  .exercise-list {
    margin-top: 20px;
  }
  </style>
  