import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { api } from './myFetch';
import { type DataEnvelope } from './dataEnvelope';

const session = reactive({
  user: JSON.parse(localStorage.getItem('session') || '{}').user || null,
  token: JSON.parse(localStorage.getItem('session') || '{}').token || null,
});

const isLoggedIn = ref(!!session.user);
const router = useRouter();

export function getLogin() {
  onMounted(() => {
    const storedSession = localStorage.getItem('session');
    if (storedSession) {
      const parsedSession = JSON.parse(storedSession);
      session.user = parsedSession.user;
      session.token = parsedSession.token;
      isLoggedIn.value = true;
    }
  });

  const logout = () => {
    localStorage.removeItem('session');
    session.user = null;
    session.token = null;
    isLoggedIn.value = false;
    router.push('/');
  };

  const login = async (loginIdentifier: string, password: string) => {
    const response = await api<DataEnvelope<any>>('users/login', { identifier: loginIdentifier, password }, 'POST');
    if (response.isSuccess) {
      const newSession = {
        token: response.data.token,
        user: response.data.users,
      };
      localStorage.setItem('session', JSON.stringify(newSession));
      session.user = newSession.user;
      session.token = newSession.token;
      isLoggedIn.value = true;
    } else {
      throw new Error(response.message);
    }
  };

  return { isLoggedIn, session, logout, login };
}
