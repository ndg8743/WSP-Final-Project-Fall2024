import { api } from './myFetch.ts';

export async function getAll(): Promise<{ data: Meal[]; total: number }> {
  const response = await api<{ data: Meal[]; total: number }>('meals');
  return response;
}

export interface Meal {
  id: number;
  userId: number;
  name: string;
  calories: number;
  date: string;
}
