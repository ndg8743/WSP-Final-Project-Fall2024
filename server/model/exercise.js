import data from '../data/exercises.json';
import type { DataListEnvelope } from './user.js';

export function getAll(): DataListEnvelope<Exercise> {
  return {
    data: data.exercises,
    total: data.exercises.length,
  };
}

export function get(id: number): Exercise | undefined {
  return data.exercises.find(exercise => exercise.id === id);
}

export function add(exercise: Exercise): Exercise {
  exercise.id = data.exercises.reduce((prev, x) => (x.id > prev ? x.id : prev), 0) + 1;
  data.exercises.push(exercise);
  return exercise;
}

export function update(id: number, exercise: Partial<Exercise>): Exercise | undefined {
  const exerciseToUpdate = get(id);
  if (exerciseToUpdate) {
    Object.assign(exerciseToUpdate, exercise);
  }
  return exerciseToUpdate;
}

export function remove(id: number): boolean {
  const index = data.exercises.findIndex(exercise => exercise.id === id);
  if (index !== -1) {
    data.exercises.splice(index, 1);
    return true;
  }
  return false;
}

export interface Exercise {
  id: number;
  userId: number;
  name: string;
  duration: number;
  caloriesBurned: number;
  date: string;
}