import { api } from './myFetch'
import type { DataListEnvelope, DataEnvelope } from './dataEnvelope'

export interface Exercise {
  id: number
  name: string
  duration: number
  caloriesBurned: number
  date: string
  userId: number
}

export async function getUserExercises(userId: number): Promise<DataListEnvelope<Exercise>> {
  return api<DataListEnvelope<Exercise>>(`exercises?userId=${userId}`)
}

export async function getExercises(): Promise<DataListEnvelope<Exercise>> {
  const response = await api<DataListEnvelope<Exercise>>('exercises/all')
  if (response.isSuccess) {
    response.data.forEach((exercise: Exercise) => {
      exercise.caloriesBurned = exercise.caloriesBurned ?? 0
    })
  } else {
    console.error('Error fetching exercises:', response.message)
  }
  return response
}

export async function getExerciseById(id: number): Promise<DataEnvelope<Exercise>> {
  return api<DataEnvelope<Exercise>>(`exercises/${id}`)
}

export async function addExercise(exercise: Exercise): Promise<DataEnvelope<Exercise>> {
  return api<DataEnvelope<Exercise>>('exercises', exercise, 'POST')
}

export async function updateExercise(
  id: number,
  exercise: Exercise
): Promise<DataEnvelope<Exercise>> {
  return api<DataEnvelope<Exercise>>(`exercises/${id}`, exercise, 'PATCH')
}

export async function deleteExercise(id: number): Promise<void> {
  return api<void>(`exercises/${id}`, null, 'DELETE')
}
