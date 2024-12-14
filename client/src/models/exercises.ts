import { api } from './myFetch.js'
import type { DataListEnvelope, DataEnvelope } from './dataEnvelope.js'

export interface Exercise {
  id: number
  userId: number
  name: string
  duration: number
  caloriesBurned: number
  date: string
}

export async function getAll(): Promise<DataListEnvelope<Exercise>> {
  return api<DataListEnvelope<Exercise>>('exercises/all')
}

export async function getUserExercises(userId: number): Promise<DataListEnvelope<Exercise>> {
  console.log(`Fetching exercises for userId: ${userId}`) // Debug log
  const response = await api<DataListEnvelope<Exercise>>(`exercises/${userId}/exercises`)
  if (!response.data) {
    response.data = []
  }
  if (response.isSuccess) {
    response.data.forEach((exercise: Exercise) => {
      exercise.caloriesBurned = exercise.caloriesBurned ?? 0
    })
  } else {
    console.error('Error fetching exercises:', response.message)
  }
  return response
}

export async function getExercise(id: number): Promise<DataEnvelope<Exercise>> {
  return api<DataEnvelope<Exercise>>(`exercises/${id}`)
}

export async function addExercise(exercise: Omit<Exercise, 'id'>): Promise<DataEnvelope<Exercise>> {
  return api<DataEnvelope<Exercise>>('exercises', exercise, 'POST')
}

export async function updateExercise(
  id: number,
  exercise: Partial<Exercise>
): Promise<DataEnvelope<Exercise>> {
  return api<DataEnvelope<Exercise>>(`exercises/${id}`, exercise, 'PATCH')
}

export async function deleteExercise(id: number): Promise<void> {
  return api<void>(`exercises/${id}`, null, 'DELETE')
}
