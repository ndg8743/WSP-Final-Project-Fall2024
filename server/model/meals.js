import data from '../data/meals.json';

export async function getAll(): Promise<{ data: Meal[]; total: number }> {
  return {
    data: data,
    total: data.length,
  };
}

export async function get(id: number): Promise<Meal | undefined> {
  return data.find(meal => meal.id === id);
}

export async function add(meal: Meal): Promise<Meal> {
  meal.id = data.reduce((prev, x) => (x.id > prev ? x.id : prev), 0) + 1;
  data.push(meal);
  return meal;
}

export async function update(id: number, meal: Partial<Meal>): Promise<Meal | undefined> {
  const mealToUpdate = await get(id);
  if (mealToUpdate) {
    Object.assign(mealToUpdate, meal);
  }
  return mealToUpdate;
}

export async function remove(id: number): Promise<boolean> {
  const index = data.findIndex(meal => meal.id === id);
  if (index !== -1) {
    data.splice(index, 1);
    return true;
  }
  return false;
}

export interface Meal {
  id: number;
  userId: number;
  name: string;
  calories: number;
  date: string;
}
