import { api } from './myFetch'
import type { DataListEnvelope, DataEnvelope } from './dataEnvelope'

export interface Meals {
  id: number
  name: string
  mealCalories: number
  date: string // ISO string
  userId: number // Match backend property name
}

export async function getMeals(): Promise<DataListEnvelope<Meals>> {
  const response = await api<DataListEnvelope<Meals>>('meals/all')
  if (response.isSuccess) {
    response.data.forEach((meal: Meals) => {
      meal.mealCalories = meal.mealCalories ?? 0
    })
  } else {
    console.error('Error fetching meals:', response.message)
  }
  return response
}

export async function getMealById(id: number): Promise<DataEnvelope<Meals>> {
  return api<DataEnvelope<Meals>>(`meals/${id}`)
}

export async function addMeal(meal: Meals): Promise<DataEnvelope<Meals>> {
  return api<DataEnvelope<Meals>>('meals', meal, 'POST')
}

export async function updateMeal(id: number, meal: Meals): Promise<DataEnvelope<Meals>> {
  return api<DataEnvelope<Meals>>(`meals/${id}`, meal, 'PATCH')
}

export async function deleteMeal(id: number): Promise<void> {
  return api<void>(`meals/${id}`, null, 'DELETE')
}
