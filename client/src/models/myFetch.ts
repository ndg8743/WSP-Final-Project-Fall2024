import { getSession } from './login.js'

export const API_URL = process.env.VITE_API_URL || 'http://localhost:3000/api/v1/'

export async function rest<T>(url: string, data?: any, method?: string): Promise<T> {
  console.log(`Request: ${method ?? (data ? 'POST' : 'GET')} ${url}`, data)
  const session = getSession()
  
  try {
    const response = await fetch(url, {
      method: method ?? (data ? 'POST' : 'GET'),
      headers: {
        'Content-Type': 'application/json',
        Authorization: session.token ? `Bearer ${session.token}` : ''
      },
      body: data ? JSON.stringify(data) : undefined
    });

    // First check if the response is ok
    if (!response.ok) {
      // Try to get error message from response
      try {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      } catch (e) {
        // If can't parse JSON, use generic error
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    }

    // Parse successful response
    const responseData = await response.json();
    console.log(`Response from ${url}:`, responseData);

    // Check if the response indicates an error even with 200 status
    if (responseData && !responseData.isSuccess) {
      throw new Error(responseData.message || 'Operation failed');
    }

    return responseData;
  } catch (err) {
    console.error(`Error fetching ${url}:`, err);
    
    // Handle session expiration
    if (err instanceof Error && err.message.includes('401')) {
      localStorage.removeItem('session');
      window.location.href = '/login';
    }
    
    throw err;
  }
}

export function api<T>(url: string, data?: any, method?: string): Promise<T> {
  return rest<T>(API_URL + url, data, method)
}
