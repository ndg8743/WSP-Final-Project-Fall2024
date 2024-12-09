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
  const response = await api<DataListEnvelope<Meals>>('Meals')
  if (response.isSuccess) {
    response.data.forEach((meal: Meals) => {
      meal.calories = meal.calories ?? 0
    })
  } else {
    console.error('Error fetching meals:', response.message)
  }
  return response
}

export async function getMealById(id: number): Promise<DataEnvelope<Meals>> {
  return api<DataEnvelope<Meals>>(`Meals/${id}`)
}

export async function addMeal(meal: Meals): Promise<DataEnvelope<Meals>> {
  return api<DataEnvelope<Meals>>('Meals', meal, 'POST')
}

export async function updateMeal(id: number, meal: Meals): Promise<DataEnvelope<Meals>> {
  return api<DataEnvelope<Meals>>(`Meals/${id}`, meal, 'PATCH')
}

export async function deleteMeal(id: number): Promise<void> {
  return api<void>(`Meals/${id}`, null, 'DELETE')
}
