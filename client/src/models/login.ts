import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const isLoggedIn = ref(false)
const router = useRouter()

export function getLogin() {
  onMounted(() => {
    const session = localStorage.getItem('session')
    if (session) {
      isLoggedIn.value = true
    }
  })

  const logout = () => {
    localStorage.removeItem('session')
    isLoggedIn.value = false
    router.push('/')
  }

  const login = (user: { token: string }) => {
    localStorage.setItem('session', JSON.stringify(user)); // Store the session token
    isLoggedIn.value = true;
  }

  return { isLoggedIn, logout, login }
}
