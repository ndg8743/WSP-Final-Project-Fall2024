import { api } from './myFetch'
import type { DataListEnvelope, DataEnvelope } from './dataEnvelope'

export interface Users {
  id: number
  name: string
  email: string
  role: 'user' | 'admin'
  image?: string // Image property
  friends?: number[] // Include friends array for easier client-side logic
}

const DEFAULT_IMAGE_PATH = '/assets/User.jpg' // Adjusted for client-side resolution

export async function getUsers(): Promise<DataListEnvelope<Users>> {
  const response = await api<DataListEnvelope<Users>>('users')
  if (response.isSuccess) {
    response.data.forEach((user: Users) => {
      user.image = user.image ?? DEFAULT_IMAGE_PATH
    })
  } else {
    console.error('Error fetching users:', response.message)
  }
  return response
}

export async function getUserById(id: number): Promise<DataEnvelope<Users>> {
  const response = await api<DataEnvelope<Users>>(`users/${id}`)
  if (response.isSuccess) {
    response.data.image = response.data.image ?? DEFAULT_IMAGE_PATH
  } else {
    console.error(`Error fetching user ${id}:`, response.message)
  }
  return response
}

export async function addUser(user: Users): Promise<DataEnvelope<Users>> {
  const response = await api<DataEnvelope<Users>>('users', user, 'POST')

  if (response.data) {
    response.data.image = response.data.image ?? DEFAULT_IMAGE_PATH
  }

  return response
}

export async function updateUsers(id: number, user: Users): Promise<DataEnvelope<Users>> {
  const response = await api<DataEnvelope<Users>>(`users/${id}`, user, 'PATCH')

  if (response.data) {
    response.data.image = response.data.image ?? DEFAULT_IMAGE_PATH
  }

  return response
}

export async function deleteUsers(id: number): Promise<void> {
  return api<void>(`users/${id}`, null, 'DELETE')
}

export async function addFriend(userId: number, friendId: number): Promise<DataEnvelope<Users>> {
  const response = await api<DataEnvelope<Users>>(`users/${userId}/friends/${friendId}`, {}, 'POST')

  if (response.data) {
    response.data.image = response.data.image ?? DEFAULT_IMAGE_PATH
  }

  return response
}

export async function removeFriend(userId: number, friendId: number): Promise<DataEnvelope<Users>> {
  const response = await api<DataEnvelope<Users>>(
    `users/${userId}/friends/${friendId}`,
    {},
    'DELETE'
  )

  if (response.data) {
    response.data.image = response.data.image ?? DEFAULT_IMAGE_PATH
  }

  return response
}
