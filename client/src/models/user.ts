import { api } from './myFetch'
import type { DataListEnvelope, DataEnvelope } from './dataEnvelope'

export interface User {
  id: number
  name: string
  email: string
  role: 'user' | 'admin'
  image?: string // Image property
  friends?: number[] // Include friends array for easier client-side logic
}

const DEFAULT_IMAGE_PATH = '/client/src/assets/User.jpg' // Path to stock photo

export async function getUsers(): Promise<DataListEnvelope<User>> {
  const response = await api<DataListEnvelope<User>>('users')

  response.data.forEach((user) => {
    user.image = user.image ?? DEFAULT_IMAGE_PATH
  })

  return response
}

export async function getUserById(id: number): Promise<DataEnvelope<User>> {
  const response = await api<DataEnvelope<User>>(`users/${id}`)

  if (response.data) {
    response.data.image = response.data.image ?? DEFAULT_IMAGE_PATH
  }

  return response
}

export async function addUser(user: User): Promise<DataEnvelope<User>> {
  const response = await api<DataEnvelope<User>>('users', user, 'POST')

  if (response.data) {
    response.data.image = response.data.image ?? DEFAULT_IMAGE_PATH
  }

  return response
}

export async function updateUser(id: number, user: User): Promise<DataEnvelope<User>> {
  const response = await api<DataEnvelope<User>>(`users/${id}`, user, 'PATCH')

  if (response.data) {
    response.data.image = response.data.image ?? DEFAULT_IMAGE_PATH
  }

  return response
}

export async function deleteUser(id: number): Promise<void> {
  return api<void>(`users/${id}`, null, 'DELETE')
}

export async function addFriend(userId: number, friendId: number): Promise<DataEnvelope<User>> {
  const response = await api<DataEnvelope<User>>(`users/${userId}/friends/${friendId}`, {}, 'POST')

  if (response.data) {
    response.data.image = response.data.image ?? DEFAULT_IMAGE_PATH
  }

  return response
}

export async function removeFriend(userId: number, friendId: number): Promise<DataEnvelope<User>> {
  const response = await api<DataEnvelope<User>>(
    `users/${userId}/friends/${friendId}`,
    {},
    'DELETE'
  )

  if (response.data) {
    response.data.image = response.data.image ?? DEFAULT_IMAGE_PATH
  }

  return response
}
