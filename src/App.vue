<script setup lang="ts">
// @/App.vue
import { storeSettings } from '@/stores/storeSettings'
import Toast from 'primevue/toast'
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'

const settingsStore = storeSettings()

onMounted(async () => {
  await settingsStore.settingsLoad()
})
</script>

<template>
  <img
    src="@/assets/background.svg"
    alt="Background"
    class="w-full h-[250px] absolute top-0 left-0 z-[-1] transform rotate-180 opacity-50"
  >
  <div class="min-h-screen max-w-[90rem] mx-auto flex flex-col p-6 mb-20">
    <Header />
    <div class="flex-1 ">
      <RouterView :key="$route.name" />
      <ScrollTop />
    </div>
    <Toast />
  </div>
</template>
