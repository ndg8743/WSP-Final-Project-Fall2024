import { api } from './myFetch.ts';
import type { DataListEnvelope } from './user.js';

export async function getAll(): Promise<DataListEnvelope<Exercise>> {
  const response = await api<DataListEnvelope<Exercise>>('exercises');
  return response;
}

export interface Exercise {
  id: number;
  userId: number;
  name: string;
  duration: number;
  caloriesBurned: number;
  date: string;
}