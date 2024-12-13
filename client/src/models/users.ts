import { api } from './myFetch.js'
import type { DataListEnvelope, DataEnvelope } from './dataEnvelope.js'

export interface Users {
  id: number
  name: string
  email: string
  role: 'user' | 'admin'
  image?: string
  password: string
  friends?: number[]
}

const DEFAULT_IMAGE_PATH = '../src/assets/User.jpg'

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
  try {
    const response = await api<DataEnvelope<Users>>(`users/${id}`)
    if (response.isSuccess && response.data) {
      response.data.image = response.data.image ?? DEFAULT_IMAGE_PATH
      response.data.friends = response.data.friends ?? []
    } else {
      console.error(`Error fetching user ${id}:`, response.message)
    }
    return response
  } catch (error) {
    console.error(`Unexpected error fetching user ${id}:`, error)
    throw error
  }
}

export async function addUser(user: Users): Promise<DataEnvelope<Users>> {
  const response = await api<DataEnvelope<Users>>('users', user, 'POST')
  if (response.data) {
    response.data.image = response.data.image ?? DEFAULT_IMAGE_PATH
  }
  return response
}

export async function updateUser(id: number, user: Users): Promise<DataEnvelope<Users>> {
  const response = await api<DataEnvelope<Users>>(`users/${id}`, user, 'PATCH')
  if (response.data) {
    response.data.image = response.data.image ?? DEFAULT_IMAGE_PATH
  }
  return response
}

export async function deleteUser(id: number): Promise<DataEnvelope<void>> {
  return await api<DataEnvelope<void>>(`users/${id}`, null, 'DELETE')
}

export async function addFriend(id: number, friendId: number): Promise<DataEnvelope<Users>> {
  try {
    const response = await api<DataEnvelope<Users>>(
      `users/${id}/friends/${friendId}`,
      {},
      'POST'
    )
    if (!response.isSuccess) {
      console.error('Error adding friend:', response.message)
    }
    return response
  } catch (error) {
    console.error('Unexpected error in addFriend:', error)
    throw error
  }
}

export async function removeFriend(id: number, friendId: number): Promise<DataEnvelope<Users>> {
  const response = await api<DataEnvelope<Users>>(
    `users/${id}/friends/${friendId}`,
    {},
    'DELETE'
  )
  if (response.data) {
    response.data.image = response.data.image ?? DEFAULT_IMAGE_PATH
  }
  return response
}
