import { ref, reactive } from 'vue';
import { api } from './myFetch.js';
import { type DataEnvelope } from './dataEnvelope.js';

interface LoginResponse {
  token: string;
  users: {
    id: number;
    name: string;
    email: string;
    role: 'user' | 'admin';
    image?: string;
    friends?: number[];
  };
}

const session = reactive({
  user: null as any, // User information
  token: null as string | null, // JWT token
});

// Reactive state for login status
const isLoggedIn = ref(false);

export function getLogin() {
  // Load session data from localStorage
  const loadSession = () => {
    try {
      const storedSession = localStorage.getItem('session');
      if (storedSession) {
        const parsedSession = JSON.parse(storedSession);
        if (parsedSession.token && parsedSession.user) {
          session.user = parsedSession.user;
          session.token = parsedSession.token;
          isLoggedIn.value = true;
        }
      }
    } catch (error) {
      console.error('Error loading session:', error);
      // Clear potentially corrupted session
      localStorage.removeItem('session');
      session.user = null;
      session.token = null;
      isLoggedIn.value = false;
    }
  }

  // Initialize session on module load
  loadSession();

  // Logout function to clear session
  const logout = () => {
    localStorage.removeItem('session');
    session.user = null;
    session.token = null;
    isLoggedIn.value = false;
    window.location.href = '/'; // Use window.location for navigation instead of router
  };

  // Login function to authenticate the user
  const login = async (loginIdentifier: string, password: string): Promise<void> => {
    try {
      // Call the `users/login` REST endpoint
      const response = await api<DataEnvelope<LoginResponse>>(
        'users/login',
        { identifier: loginIdentifier, password: password },
        'POST'
      );

      if (!response || !response.isSuccess || !response.data) {
        throw new Error(response?.message || 'Login failed');
      }

      const { token, users: userData } = response.data;

      if (!token || !userData) {
        throw new Error('Invalid server response');
      }

      const newSession = {
        token,
        user: userData,
      };

      // Save session in localStorage
      localStorage.setItem('session', JSON.stringify(newSession));
      session.user = userData;
      session.token = token;
      isLoggedIn.value = true;

      // Use window.location for navigation instead of router
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error instanceof Error ? error.message : 'Login failed. Please check your credentials.');
    }
  };

  return { isLoggedIn, session, logout, login };
}

export function getSession() {
  return session;
}
