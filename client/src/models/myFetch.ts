export const API_URL = 'http://localhost:3001/api/v1/' // Corrected port to 3001

export function rest<T>(url: string, data?: any, method?: string): Promise<T> {
  const session = localStorage.getItem('session')
  const token = session ? JSON.parse(session).token : null

  return fetch(url, {
    method: method ?? (data ? 'POST' : 'GET'),
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '' // Ensure the token is passed
    },
    body: data ? JSON.stringify(data) : undefined
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      return res.json()
    })
    .catch((err) => {
      console.error(`Error fetching ${url}:`, err)
      throw err
    })
}

export function api<T>(url: string, data?: any, method?: string): Promise<T> {
  return rest<T>(API_URL + url, data, method)
}
