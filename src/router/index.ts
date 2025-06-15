// @/router/index.ts
import AboutView from '@/views/AboutView.vue'
import CollectionsView from '@/views/CollectionsView.vue'
import ContentsView from '@/views/ContentsView.vue'
import LoginView from '@/views/LoginView.vue'
import SingleView from '@/views/SingleView.vue'
import TermsView from '@/views/TermsView.vue'
import ToolsView from '@/views/ToolsView.vue'
import UploadsView from '@/views/UploadsView.vue'
import Pocketbase from 'pocketbase'
import { createRouter, createWebHistory } from 'vue-router'

const pb = new Pocketbase(import.meta.env.VITE_BASE_URL)

export {}

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth: boolean
    customEndpoint: string
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/terms',
      name: 'terms',
      component: TermsView,
    },
    {
      path: '/about',
      name: 'about',
      component: AboutView,
    },
    {
      path: '/tools',
      name: 'tools',
      component: ToolsView,
    },
    {
      path: '/tools/:id',
      name: 'tools_with_id',
      component: ToolsView,
    },
    {
      path: '/',
      name: 'contents',
      component: ContentsView,
      meta: { requiresAuth: true, customEndpoint: 'allContents' },
    },
    {
      path: '/contents',
      name: 'home_alt',
      component: ContentsView,
      meta: { requiresAuth: true, customEndpoint: 'allContents' },
    },
    {
      path: '/me/likes',
      name: 'likes',
      component: ContentsView,
      meta: { requiresAuth: true, personalizedView: true, customEndpoint: 'likedContents' },
    },
    {
      path: '/me/collections',
      name: 'customcollections',
      component: CollectionsView,
      meta: { requiresAuth: true, isSet: false, personalizedView: true, customEndpoint: 'savedCollections' },
    },
    {
      path: '/single/:id',
      name: 'single',
      component: SingleView,
      meta: { requiresAuth: true, customEndpoint: 'singleContent' },
    },
    {
      path: '/sets',
      name: 'sets',
      component: CollectionsView,
      meta: { requiresAuth: true, isSet: true, customEndpoint: 'allSets' },
    },
    {
      path: '/set/:id',
      name: 'set',
      component: ContentsView,
      meta: { requiresAuth: true, isSet: true, customEndpoint: 'setContents' },
    },
    {
      path: '/collections',
      name: 'collections',
      component: CollectionsView,
      meta: { requiresAuth: true, isSet: false, customEndpoint: 'allCollections' },
    },
    {
      path: '/collection/:id',
      name: 'collection',
      component: ContentsView,
      meta: { requiresAuth: true, isSet: false, customEndpoint: 'collectionContents' },
    },
    {
      path: '/uploads',
      name: 'uploads',
      component: UploadsView,
      meta: { requiresAuth: true, isSet: false, customEndpoint: 'collectionContents' },
    },
    {
      path: '/me/uploads',
      name: 'myuploads',
      component: ContentsView,
      meta: { requiresAuth: true, isSet: true, customEndpoint: 'myContents' },
    },
  ],
})

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const isAuthenticated = pb.authStore.isValid

  if (requiresAuth && !isAuthenticated)
    next('/login')
  else if (to.path === '/login' && isAuthenticated)
    next('/')
  else
    next()
})

export default router
