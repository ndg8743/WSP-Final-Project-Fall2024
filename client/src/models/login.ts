import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { type DataEnvelope } from '../models/dataEnvelope'
import { type Users } from '../models/users'

const session = reactive({
  users: JSON.parse(localStorage.getItem('session') || '{}').users || null,
  token: JSON.parse(localStorage.getItem('session') || '{}').token || null
})

const isLoggedIn = ref(!!session.users)
const router = useRouter()

export function getLogin() {
  onMounted(() => {
    const storedSession = localStorage.getItem('session')
    if (storedSession) {
      const parsedSession = JSON.parse(storedSession)
      session.users = parsedSession.users
      session.token = parsedSession.token
      isLoggedIn.value = true
    }
  })

  const logout = () => {
    localStorage.removeItem('session')
    session.users = null
    session.token = null
    isLoggedIn.value = false
    router.push('/')
  }

  const login = (newSession: { token: string; users: any }) => {
    localStorage.setItem('session', JSON.stringify(newSession))
    session.users = newSession.users
    session.token = newSession.token
    isLoggedIn.value = true
  }

  return { isLoggedIn, session, logout, login }
}
