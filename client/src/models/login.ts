import { ref, reactive } from 'vue'
import { api } from './myFetch.js'
import { type DataEnvelope } from './dataEnvelope.js'

export interface User {
  id: number
  name: string
  email: string
  role: 'user' | 'admin'
  image?: string
  friends?: number[]
}

interface LoginResponse {
  token: string
  users: User
}

interface Session {
  user: User | null
  token: string | null
}

const session = reactive<Session>({
  user: null,
  token: null,
})

const isLoggedIn = ref(false)

/**
 * Custom error for authentication-related issues
 */
export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthenticationError'
  }
}

/**
 * Provides login-related functionality and session management
 */
export function getLogin() {
  /**
   * Loads session data from localStorage
   * @throws AuthenticationError if session data is corrupted
   */
  const loadSession = () => {
    try {
      const storedSession = localStorage.getItem('session')
      if (storedSession) {
        const parsedSession = JSON.parse(storedSession) as Session
        if (parsedSession.token && parsedSession.user) {
          session.user = parsedSession.user
          session.token = parsedSession.token
          isLoggedIn.value = true
        }
      }
    } catch (error) {
      localStorage.removeItem('session')
      session.user = null
      session.token = null
      isLoggedIn.value = false
      throw new AuthenticationError('Failed to load session data')
    }
  }

  loadSession()

  /**
   * Logs out the current user and clears the session
   */
  const logout = () => {
    localStorage.removeItem('session')
    session.user = null
    session.token = null
    isLoggedIn.value = false
    window.location.href = '/'
  }

  /**
   * Authenticates a user with their credentials
   * @param loginIdentifier Email or username
   * @param password User's password
   * @throws AuthenticationError if login fails
   */
  const login = async (loginIdentifier: string, password: string): Promise<void> => {
    try {
      const response = await api<DataEnvelope<LoginResponse>>(
        'users/login',
        { identifier: loginIdentifier, password: password },
        'POST'
      )

      if (!response || !response.isSuccess || !response.data) {
        throw new AuthenticationError(response?.message || 'Login failed')
      }

      const { token, users: userData } = response.data

      if (!token || !userData) {
        throw new AuthenticationError('Invalid server response')
      }

      const newSession: Session = {
        token,
        user: userData,
      }

      localStorage.setItem('session', JSON.stringify(newSession))
      session.user = userData
      session.token = token
      isLoggedIn.value = true

      window.location.href = '/dashboard'
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error
      }
      throw new AuthenticationError(
        error instanceof Error ? error.message : 'Login failed. Please check your credentials.'
      )
    }
  }

  return { isLoggedIn, session, logout, login }
}

/**
 * Returns the current session state
 */
export function getSession(): Session {
  return session
}
