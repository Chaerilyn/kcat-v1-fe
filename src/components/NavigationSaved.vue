<script setup lang="ts">
import { useWindowSize } from '@/composables/useWindowSize'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const {
  isMobile,
} = useWindowSize()

const router = useRouter()
const route = useRoute()

const currentRouteName = computed(() => route.name)

function changeRoute(path: string) {
  router.push({ name: path })
}
</script>

<template>
  <div class="flex items-start">
    <Button
      class="flex-1 mr-2" icon="pi pi-home" severity="contrast" :label="isMobile ? undefined : 'Home'" @click="changeRoute('contents')"
    />
    <div class="flex gap-2 mb-4 flex-8">
      <Button
        class="flex-1" :class="currentRouteName === 'likes' ? 'active' : 'inactive'" icon="pi pi-heart-fill"
        :label="isMobile ? undefined : 'My Likes'" @click="changeRoute('likes')"
      />
      <Button
        class="flex-1" :class="currentRouteName === 'customcollections' ? 'active' : 'inactive'" icon="pi pi-folder"
        :label="isMobile ? undefined : 'My Collections'" @click="changeRoute('customcollections')"
      />
    </div>
  </div>
</template>

<style scoped>
.inactive {
  background-color: var(--p-primary-100) !important;
  border-color: var(--p-primary-100) !important;
}
</style>
