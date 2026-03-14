import { createRouter, createWebHistory } from 'vue-router'

const AUTH_KEY = 'reel-user-booking-auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/Login.vue'),
      meta: { public: true },
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('../views/Register.vue'),
      meta: { public: true },
    },
    {
      path: '/',
      name: 'Home',
      component: () => import('../views/Home.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/movie/:id',
      name: 'MovieDetail',
      component: () => import('../views/MovieDetail.vue'),
      props: true,
      meta: { requiresAuth: true },
    },
    {
      path: '/showtime/:showtimeId/seats',
      name: 'SeatPick',
      component: () => import('../views/SeatPick.vue'),
      props: true,
      meta: { requiresAuth: true },
    },
    {
      path: '/booking/confirmation',
      name: 'BookingConfirmation',
      component: () => import('../views/BookingConfirmation.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/profile',
      name: 'Profile',
      component: () => import('../views/Profile.vue'),
      meta: { requiresAuth: true },
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.beforeEach((to, _from, next) => {
  let user: unknown = null
  try {
    const raw = localStorage.getItem(AUTH_KEY)
    if (raw) {
      const data = JSON.parse(raw) as { user?: unknown }
      user = data?.user
    }
  } catch {
    // ignore
  }

  const isAuthenticated = !!user

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ path: '/login', query: { redirect: to.fullPath } })
    return
  }
  if (to.meta.public && isAuthenticated && (to.path === '/login' || to.path === '/register')) {
    const redirectTo = (to.query.redirect as string) || '/'
    next(redirectTo)
    return
  }
  next()
})

export default router
