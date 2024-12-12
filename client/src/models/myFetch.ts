import { reactive } from 'vue'

export const API_URL = process.env.VITE_API_URL || 'http://localhost:3000/api/v1/'

const session = reactive({
  token: JSON.parse(localStorage.getItem('session') || '{}').token || null
})

export function rest<T>(url: string, data?: any, method?: string): Promise<T> {
  console.log(`Request: ${method ?? (data ? 'POST' : 'GET')} ${url}`, data)
  return fetch(url, {
    method: method ?? (data ? 'POST' : 'GET'),
    headers: {
      'Content-Type': 'application/json',
      Authorization: session.token ? `Bearer ${session.token}` : ''
    },
    body: data ? JSON.stringify(data) : undefined
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      return res.json()
    })
    .then((data) => {
      console.log(`Response from ${url}:`, data)
      return data
    })
    .catch((err) => {
      console.error(`Error fetching ${url}:`, err)
      throw err
    })
}

export function api<T>(url: string, data?: any, method?: string): Promise<T> {
  return rest<T>(API_URL + url, data, method)
}
