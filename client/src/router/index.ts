import { createRouter, createWebHistory } from 'vue-router'
import { routes } from 'vue-router/auto-routes'

declare module 'vue-router/auto-routes'

// Retrieve session data
const getSession = () => {
  const session = localStorage.getItem('session')
  return session ? JSON.parse(session) : null
}

const router = createRouter({
  history: createWebHistory((import.meta as any).env.BASE_URL as string),
  routes
})

// Add a global navigation guard
router.beforeEach((to, from, next) => {
  const session = getSession()

  // Example: Protect routes with `meta.requiresAuth`
  if (to.meta?.requiresAuth && !session?.token) {
    next({ path: '/', query: { redirect: to.fullPath } }) // Redirect to login
  } else if (to.meta?.requiresAdmin && session?.user.role !== 'admin') {
    next({ name: 'unauthorized' }) // Redirect unauthorized
  } else {
    next() // Allow access
  }
})

export default router
