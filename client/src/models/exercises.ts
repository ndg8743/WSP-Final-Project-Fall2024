import { api } from './myFetch'
import type { DataListEnvelope, DataEnvelope } from './dataEnvelope'

export interface Exercises {
  id: number
  name: string
  duration: number // Duration in minutes
  calories: number // Match backend property name
  date: string // ISO string
  user_id: number // Match backend property name
}

export async function getExercises(): Promise<DataListEnvelope<Exercises>> {
  return api<DataListEnvelope<Exercises>>('Exercises')
}

export async function getExerciseById(id: number): Promise<DataEnvelope<Exercises>> {
  return api<DataEnvelope<Exercises>>(`Exercises/${id}`)
}

export async function addExercise(exercises: Exercises): Promise<DataEnvelope<Exercises>> {
  return api<DataEnvelope<Exercises>>('Exercises', exercises, 'POST')
}

export async function updateExercise(
  id: number,
  exercises: Exercises
): Promise<DataEnvelope<Exercises>> {
  return api<DataEnvelope<Exercises>>(`Exercises/${id}`, exercises, 'PATCH')
}

export async function deleteExercise(id: number): Promise<void> {
  return api<void>(`Exercises/${id}`, null, 'DELETE')
}
