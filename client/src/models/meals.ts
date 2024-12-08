import { api } from './myFetch'
import type { DataListEnvelope, DataEnvelope } from './dataEnvelope'

export interface Meal {
  id: number
  name: string
  calories: number
  date: string // ISO string
  user_id: number // Match backend property name
}

export async function getMeals(): Promise<DataListEnvelope<Meal>> {
  return api<DataListEnvelope<Meal>>('meals')
}

export async function getMealById(id: number): Promise<DataEnvelope<Meal>> {
  return api<DataEnvelope<Meal>>(`meals/${id}`)
}

export async function addMeal(meal: Meal): Promise<DataEnvelope<Meal>> {
  return api<DataEnvelope<Meal>>('meals', meal, 'POST')
}

export async function updateMeal(id: number, meal: Meal): Promise<DataEnvelope<Meal>> {
  return api<DataEnvelope<Meal>>(`meals/${id}`, meal, 'PATCH')
}

export async function deleteMeal(id: number): Promise<void> {
  return api<void>(`meals/${id}`, null, 'DELETE')
}
