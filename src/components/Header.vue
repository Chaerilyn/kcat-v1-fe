<script setup lang="ts">
// @/components/Header.vue
import { storeAuth } from '@/stores/storeAuth'
import Avatar from 'primevue/avatar'
import Menu from 'primevue/menu'
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()

const authStore = storeAuth()

function navigateHome() {
  const { page, ...remainingQuery } = route.query
  router.push({ name: 'contents', query: remainingQuery })
}

function navigateTerms() {
  router.push({ name: 'terms' })
}

function navigateAbout() {
  router.push({ name: 'about' })
}

const menu = ref()
const items = ref([
  {
    label: 'Options',
    items: [
      {
        label: 'My Likes',
        icon: 'pi pi-heart-fill',
        command: () => {
          router.push({ name: 'likes', query: route.query })
        },
      },
      {
        label: 'My Collections',
        icon: 'pi pi-images',
        command: () => {
          router.push({ name: 'customcollections', query: route.query })
        },
      },
      {
        label: 'My Uploads',
        icon: 'pi pi-cloud-upload',
        command: () => {
          router.push({ name: 'uploads' })
        },
      },
      {
        label: 'Imgur Tools',
        icon: 'pi pi-wrench',
        command: () => {
          router.push({ name: 'tools' })
        },
      },
      {
        label: 'Logout',
        icon: 'pi pi-sign-out',
        command: () => {
          authStore.logout()
          router.push({ name: 'login' })
        },
      },
    ],
  },
])

function userMenuOpen(event: MouseEvent) {
  menu.value.toggle(event)
}
</script>

<template>
  <div class="flex justify-between items-center select-none ">
    <div />
    <div class="pl-[52px]">
      <div class="relative inline-flex flex-col items-center">
        <!-- Version Div -->
        <div class="absolute bottom-4.75 right-0 bg-black text-[8px] p-1 rounded-lg opacity-75">
          v0.61 - 02/07/2025
        </div>
        <!-- Logo -->
        <img src="../assets/kpopcat3.png" width="200" class="cursor-pointer" @click="navigateHome">
        <!-- Additional Info -->
        <div>
          <p class="block text-center text-[11px] text-gray-600 mt-1">
            KpopCat - Made by <em class="text-cyan-600">@chaerilyn</em> - work in progress
          </p>
        </div>
      </div>
    </div>

    <div class="card flex justify-center">
      <div v-if="authStore.isValid">
        <Avatar icon="pi pi-user" class="hover:brightness-140 transition duration-300 cursor-pointer" style="background-color: #1e293b;" size="xlarge" shape="circle" @click="userMenuOpen" />
        <Menu id="overlay_menu" ref="menu" :model="items" :popup="true" />
      </div>
    </div>
  </div>
  <div class="flex mx-auto justify-between w-36 text-gray-400 mt-0.5">
    <p class="block text-center text-xs hover:text-cyan-600 cursor-pointer" @click="navigateTerms">
      Terms •
    </p>
    <p class="block text-center text-xs hover:text-cyan-600 cursor-pointer" @click="navigateAbout">
      About •
    </p>
    <p class="block text-center text-xs hover:text-cyan-600">
      <a href="https://ko-fi.com/">
        Donate <em class="opacity-0">•</em>
      </a>
    </p>
  </div>
</template>
