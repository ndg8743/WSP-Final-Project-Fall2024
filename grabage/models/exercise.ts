import data from '../data/exercises.json';
import type { DataListEnvelope } from './user.js';

export function getAll(): DataListEnvelope<Exercise> {
  return {
    data: data.exercises,
    total: data.total,
  };
}

export interface Exercise {
  id: number;
  userId: number;
  name: string;
  duration: number;
  caloriesBurned: number;
  date: string;
}