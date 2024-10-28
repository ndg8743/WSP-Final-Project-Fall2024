import { createRouter, createWebHistory } from 'vue-router';
import { routes } from 'vue-router/auto-routes';

const router = createRouter({
  // Cast import.meta.env to any to avoid TypeScript errors
  history: createWebHistory((import.meta as any).env.BASE_URL as string),
  routes,
});

export default router;
