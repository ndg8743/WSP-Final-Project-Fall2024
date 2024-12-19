import { api } from './myFetch.js'
import type { DataListEnvelope, DataEnvelope } from './dataEnvelope.js'

export interface User {
  id?: number
  name: string
  email: string
  role: 'user' | 'admin'
  image?: string | null
  password: string
  friends?: number[]
}

export interface UserResponse extends Omit<User, 'password'> {
  id: number
}

export interface UserSearchResult {
  id: number
  name: string
  email: string
  image?: string | null
}

/**
 * Fetches all users from the API
 * @returns Promise containing the list of users
 * @throws Error if the API request fails
 */
export async function getUsers(): Promise<DataListEnvelope<UserResponse>> {
  const response = await api<DataListEnvelope<UserResponse>>('users')
  if (!response.isSuccess) {
    throw new Error(`Failed to fetch users: ${response.message}`)
  }
  return response
}

/**
 * Searches users by name or email
 * @param query The search query
 * @param limit Maximum number of results to return
 * @returns Promise containing the search results
 */
export async function searchUsers(query: string, limit: number = 5): Promise<DataListEnvelope<UserSearchResult>> {
  const response = await api<DataListEnvelope<UserSearchResult>>(`users/search?q=${encodeURIComponent(query)}&limit=${limit}`)
  if (!response.isSuccess) {
    throw new Error(`Failed to search users: ${response.message}`)
  }
  return response
}

/**
 * Fetches a user by their ID
 * @param id The user's ID
 * @returns Promise containing the user data
 * @throws Error if the API request fails
 */
export async function getUserById(id: number): Promise<DataEnvelope<UserResponse>> {
  const response = await api<DataEnvelope<UserResponse>>(`users/${id}`)
  if (response.isSuccess && response.data) {
    response.data.friends = response.data.friends ?? []
  }
  return response
}

/**
 * Creates a new user
 * @param user The user data to create
 * @returns Promise containing the created user data
 * @throws Error if the API request fails
 */
export async function addUser(user: Omit<User, 'id'>): Promise<DataEnvelope<UserResponse>> {
  const response = await api<DataEnvelope<UserResponse>>('users', user, 'POST')
  if (!response.isSuccess) {
    throw new Error(`Failed to create user: ${response.message}`)
  }
  return response
}

/**
 * Updates an existing user
 * @param id The user's ID
 * @param user The user data to update
 * @returns Promise containing the updated user data
 * @throws Error if the API request fails
 */
export async function updateUser(id: number, user: Partial<User>): Promise<DataEnvelope<UserResponse>> {
  const response = await api<DataEnvelope<UserResponse>>(`users/${id}`, user, 'PATCH')
  if (!response.isSuccess) {
    throw new Error(`Failed to update user ${id}: ${response.message}`)
  }
  return response
}

/**
 * Deletes a user
 * @param id The user's ID
 * @returns Promise containing the deletion result
 * @throws Error if the API request fails
 */
export async function deleteUser(id: number): Promise<DataEnvelope<void>> {
  const response = await api<DataEnvelope<void>>(`users/${id}`, null, 'DELETE')
  if (!response.isSuccess) {
    throw new Error(`Failed to delete user ${id}: ${response.message}`)
  }
  return response
}

/**
 * Adds a friend to a user's friend list
 * @param id The user's ID
 * @param friendId The friend's ID to add
 * @returns Promise containing the updated user data
 * @throws Error if the API request fails
 */
export async function addFriend(id: number, friendId: number): Promise<DataEnvelope<UserResponse>> {
  const response = await api<DataEnvelope<UserResponse>>(
    `users/${id}/friends/${friendId}`,
    {},
    'POST'
  )
  if (!response.isSuccess) {
    throw new Error(`Failed to add friend ${friendId} to user ${id}: ${response.message}`)
  }
  return response
}

/**
 * Removes a friend from a user's friend list
 * @param id The user's ID
 * @param friendId The friend's ID to remove
 * @returns Promise containing the updated user data
 * @throws Error if the API request fails
 */
export async function removeFriend(id: number, friendId: number): Promise<DataEnvelope<UserResponse>> {
  const response = await api<DataEnvelope<UserResponse>>(
    `users/${id}/friends/${friendId}`,
    {},
    'DELETE'
  )
  if (!response.isSuccess) {
    throw new Error(`Failed to remove friend ${friendId} from user ${id}: ${response.message}`)
  }
  return response
}
