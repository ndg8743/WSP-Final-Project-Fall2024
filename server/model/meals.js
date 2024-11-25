import data from '../data/meals.json';

export function getAll(): { data: Meal[]; total: number } {
  return {
    data: data,
    total: data.length,
  };
}

export interface Meal {
  id: number;
  userId: number;
  name: string;
  calories: number;
  date: string;
}
