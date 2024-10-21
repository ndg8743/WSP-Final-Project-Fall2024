import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import MyActivity from '../views/MyActivity.vue';
import Statistics from '../views/Statistics.vue';
import FriendsActivity from '../views/FriendsActivity.vue';
import PeopleSearch from '../views/PeopleSearch.vue';
import Login from '../views/Login.vue';

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/activity', name: 'my-activity', component: MyActivity },
  { path: '/statistics', name: 'statistics', component: Statistics },
  { path: '/friends-activity', name: 'friends-activity', component: FriendsActivity },
  { path: '/people-search', name: 'people-search', component: PeopleSearch },
  { path: '/login', name: 'login', component: Login },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
