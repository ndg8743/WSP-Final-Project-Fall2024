export interface DataEnvelope<T> {
  data: T
  error?: string
}

export interface DataListEnvelope<T> extends DataEnvelope<T[]> {
  data: T[]
  total: number
  error?: string
}

export type User = {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
  friends: number[];
  image: string;
  password: string;
};

export interface Session {
  user: User
  token?: string 
}