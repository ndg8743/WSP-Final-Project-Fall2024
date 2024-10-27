export interface DataEnvelope<T> {
  data: T
  error?: string
}

export interface DataListEnvelope<T> extends DataEnvelope<T[]> {
  data: T[]
  total: number
  error?: string
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  friends: number[];
  image: string;
}

