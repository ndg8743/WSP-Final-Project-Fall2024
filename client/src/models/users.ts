import { api } from './myFetch.js'
import type { DataListEnvelope, DataEnvelope } from './dataEnvelope.js'

export interface User {
  id?: number
  name: string
  email: string
  role: 'user' | 'admin'
  image?: string
  password: string
  friends?: number[]
}

export interface UserResponse extends Omit<User, 'password'> {
  id: number
}

const DEFAULT_IMAGE_PATH = '../src/assets/User.jpg'

export async function getUsers(): Promise<DataListEnvelope<UserResponse>> {
  const response = await api<DataListEnvelope<UserResponse>>('users')
  if (response.isSuccess) {
    response.data.forEach((user: UserResponse) => {
      user.image = user.image ?? DEFAULT_IMAGE_PATH
    })
  } else {
    console.error('Error fetching users:', response.message)
  }
  return response
}

export async function getUserById(id: number): Promise<DataEnvelope<UserResponse>> {
  try {
    const response = await api<DataEnvelope<UserResponse>>(`users/${id}`)
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

export async function addUser(user: Omit<User, 'id'>): Promise<DataEnvelope<UserResponse>> {
  try {
    console.log('Creating user:', { ...user, password: '[REDACTED]' }) // Debug log
    const response = await api<DataEnvelope<UserResponse>>('users', user, 'POST')
    if (response.data) {
      response.data.image = response.data.image ?? DEFAULT_IMAGE_PATH
    }
    return response
  } catch (error) {
    console.error('Error adding user:', error)
    throw error
  }
}

export async function updateUser(id: number, user: Partial<User>): Promise<DataEnvelope<UserResponse>> {
  const response = await api<DataEnvelope<UserResponse>>(`users/${id}`, user, 'PATCH')
  if (response.data) {
    response.data.image = response.data.image ?? DEFAULT_IMAGE_PATH
  }
  return response
}

export async function deleteUser(id: number): Promise<DataEnvelope<void>> {
  return await api<DataEnvelope<void>>(`users/${id}`, null, 'DELETE')
}

export async function addFriend(id: number, friendId: number): Promise<DataEnvelope<UserResponse>> {
  try {
    const response = await api<DataEnvelope<UserResponse>>(
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

export async function removeFriend(id: number, friendId: number): Promise<DataEnvelope<UserResponse>> {
  const response = await api<DataEnvelope<UserResponse>>(
    `users/${id}/friends/${friendId}`,
    {},
    'DELETE'
  )
  if (response.data) {
    response.data.image = response.data.image ?? DEFAULT_IMAGE_PATH
  }
  return response
}
