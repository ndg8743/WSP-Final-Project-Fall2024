import { api } from './myFetch'
import type { DataListEnvelope, DataEnvelope } from './dataEnvelope'

export interface Exercise {
  id: number
  name: string
  duration: number // Duration in minutes
  calories: number
  date: string // ISO string
  userId: number // Add userId property
}

export async function getExercises(): Promise<DataListEnvelope<Exercise>> {
  return api<DataListEnvelope<Exercise>>('exercises');
}

export async function getExerciseById(id: number): Promise<DataEnvelope<Exercise>> {
  return api<DataEnvelope<Exercise>>(`exercises/${id}`);
}

export async function addExercise(exercise: Exercise): Promise<DataEnvelope<Exercise>> {
  return api<DataEnvelope<Exercise>>('exercises', exercise, 'POST');
}

export async function updateExercise(
  id: number,
  exercise: Exercise
): Promise<DataEnvelope<Exercise>> {
  return api<DataEnvelope<Exercise>>(`exercises/${id}`, exercise, 'PATCH');
}

export async function deleteExercise(id: number): Promise<void> {
  return api<void>(`exercises/${id}`, null, 'DELETE');
}
