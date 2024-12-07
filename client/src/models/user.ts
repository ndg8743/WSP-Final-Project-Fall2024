import { api } from './myFetch';
import type { DataListEnvelope, DataEnvelope } from './dataEnvelope';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin'; // Define roles as needed
}

export async function getUsers(): Promise<DataListEnvelope<User>> {
  return api<DataListEnvelope<User>>('users');
}

export async function getUserById(id: number): Promise<DataEnvelope<User>> {
  return api<DataEnvelope<User>>(`users/${id}`);
}

export async function addUser(user: User): Promise<DataEnvelope<User>> {
  return api<DataEnvelope<User>>('users', user, 'POST');
}

export async function updateUser(id: number, user: User): Promise<DataEnvelope<User>> {
  return api<DataEnvelope<User>>(`users/${id}`, user, 'PATCH');
}

export async function deleteUser(id: number): Promise<void> {
  return api<void>(`users/${id}`, null, 'DELETE');
}
