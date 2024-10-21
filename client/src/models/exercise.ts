import data from '../data/exercises.json';
import type { DataListEnvelope } from './user';

export function getAll(): DataListEnvelope<Exercise> {
  return {
    data: data,
    total: data.length
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
