import { api } from './myFetch.js'
import type { DataListEnvelope, DataEnvelope } from './dataEnvelope.js'

export interface Meal {
  id: number
  userId: number
  name: string
  mealCalories: number
  date: string
}

export async function getAll(): Promise<DataListEnvelope<Meal>> {
  return api<DataListEnvelope<Meal>>('meals/all')
}

export async function getUserMeals(userId: number): Promise<DataListEnvelope<Meal>> {
  console.log(`Fetching meals for userId: ${userId}`) // Debug log
  const response = await api<DataListEnvelope<Meal>>(`meals/${userId}/meals`)
  if (!response.data) {
    response.data = []
  }
  if (response.isSuccess) {
    response.data.forEach((meal: Meal) => {
      meal.mealCalories = meal.mealCalories ?? 0
    })
    console.log(`Meals fetched:`, response.data) // Debug log
  } else {
    console.error('Error fetching meals:', response.message)
  }
  return response
}

export async function getMeal(id: number): Promise<DataEnvelope<Meal>> {
  return api<DataEnvelope<Meal>>(`meals/${id}`)
}

export async function addMeal(meal: Omit<Meal, 'id'>): Promise<DataEnvelope<Meal>> {
  return api<DataEnvelope<Meal>>('meals', meal, 'POST')
}

export async function updateMeal(
  id: number,
  meal: Partial<Meal>
): Promise<DataEnvelope<Meal>> {
  return api<DataEnvelope<Meal>>(`meals/${id}`, meal, 'PATCH')
}

export async function deleteMeal(id: number): Promise<void> {
  return api<void>(`meals/${id}`, null, 'DELETE')
}
