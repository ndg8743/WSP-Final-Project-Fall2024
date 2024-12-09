import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isLoggedIn = ref(false)
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

  const login = () => {
    isLoggedIn.value = true
  }

  return { isLoggedIn, logout, login }
}