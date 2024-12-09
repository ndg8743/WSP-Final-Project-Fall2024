import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from './myFetch'
import { type DataEnvelope } from '../models/dataEnvelope'
import { type Users } from '/models/users'

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

  const login = async (loginIdentifier: string, password: string) => {
    const response = await api<DataEnvelope<Users>>('login', { loginIdentifier, password }, 'POST')
    if (response.isSuccess) {
      const newSession = {
        token: response.data.token,
        users: response.data
      }
      localStorage.setItem('session', JSON.stringify(newSession))
      session.users = newSession.users
      session.token = newSession.token
      isLoggedIn.value = true
    } else {
      throw new Error(response.message)
    }
  }

  return { isLoggedIn, session, logout, login }
}
