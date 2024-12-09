import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { api } from './myFetch';
import { type DataEnvelope } from './dataEnvelope';

const session = reactive({
  user: null, // User information
  token: null, // JWT token
});

// Reactive state for login status
const isLoggedIn = ref(false);
const router = useRouter();

export function getLogin() {
  // Load session data from localStorage when component is mounted
  onMounted(() => {
    const storedSession = localStorage.getItem('session');
    if (storedSession) {
      const parsedSession = JSON.parse(storedSession);
      session.user = parsedSession.user;
      session.token = parsedSession.token;
      isLoggedIn.value = true;
    }
  });

  // Logout function to clear session and navigate to the home page
  const logout = () => {
    localStorage.removeItem('session');
    session.user = null;
    session.token = null;
    isLoggedIn.value = false;
    router.push('/');
  };

  // Login function to authenticate the user
  const login = async (loginIdentifier: string, password: string) => {
    try {
      // Call the `users/login` REST endpoint
      const response = await api<DataEnvelope<{ token: string; users: any }>>(
        'users/login',
        { identifier: loginIdentifier, password },
        'POST'
      );

      if (response.isSuccess) {
        const newSession = {
          token: response.data.token,
          user: response.data.users,
        };

        // Save session in localStorage
        localStorage.setItem('session', JSON.stringify(newSession));
        session.user = newSession.user;
        session.token = newSession.token;
        isLoggedIn.value = true;

        // Redirect to the dashboard
        router.push('/dashboard');
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      throw new Error('Login failed. Please check your credentials.');
    }
  };

  return { isLoggedIn, session, logout, login };
}
