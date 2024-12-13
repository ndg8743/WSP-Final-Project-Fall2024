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
  
  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/signup']
  
  // Check if route requires authentication
  const requiresAuth = !publicRoutes.includes(to.path)
  
  // Check if route requires admin role
  const requiresAdmin = to.path.startsWith('/admin')

  if (requiresAuth && !session?.token) {
    // Redirect to login if authentication is required but no token exists
    next({ 
      path: '/login', 
      query: { redirect: to.fullPath } 
    })
  } else if (requiresAdmin && session?.user?.role !== 'admin') {
    // Redirect unauthorized users trying to access admin routes
    next({ path: '/unauthorized' })
  } else if (to.path === '/login' && session?.token) {
    // Redirect logged in users trying to access login page
    next({ path: '/dashboard' })
  } else {
    // Allow access
    next()
  }
})

// Handle navigation errors
router.onError((error) => {
  console.error('Navigation error:', error)
  // Redirect to error page or handle error appropriately
  router.push('/error')
})

export default router
