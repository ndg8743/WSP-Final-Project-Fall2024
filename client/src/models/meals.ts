import { api } from './myFetch'
import type { DataListEnvelope, DataEnvelope } from './dataEnvelope'

export interface Meals {
  id: number
  name: string
  calories: number
  date: string // ISO string
  user_id: number // Match backend property name
}

export async function getMeals(): Promise<DataListEnvelope<Meals>> {
  return api<DataListEnvelope<Meals>>('Meals')
}

export async function getMealById(id: number): Promise<DataEnvelope<Meals>> {
  return api<DataEnvelope<Meals>>(`Meals/${id}`)
}

export async function addMeal(meals: Meals): Promise<DataEnvelope<Meals>> {
  return api<DataEnvelope<Meals>>('Meals', meals, 'POST')
}

export async function updateMeal(id: number, meals: Meals): Promise<DataEnvelope<Meals>> {
  return api<DataEnvelope<Meals>>(`Meals/${id}`, meals, 'PATCH')
}

export async function deleteMeal(id: number): Promise<void> {
  return api<void>(`Meals/${id}`, null, 'DELETE')
}
