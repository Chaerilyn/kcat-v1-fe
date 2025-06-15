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
      icon="pi pi-bookmark-fill" class="flex-1 mr-2" severity="contrast" :label="isMobile ? undefined : 'Saved'" @click="changeRoute('likes')"
    />
    <div class="flex gap-2 mb-4 flex-8">
      <Button
        class="flex-1" :class="currentRouteName === 'contents' ? 'active' : 'inactive'" icon="pi pi-image"
        :label="isMobile ? undefined : 'Singles'" @click="changeRoute('contents')"
      />
      <Button
        class="flex-1" :class="currentRouteName === 'sets' ? 'active' : 'inactive'" icon="pi pi-images"
        :label="isMobile ? undefined : 'Sets'" @click="changeRoute('sets')"
      />
      <Button
        class="flex-1" :class="currentRouteName === 'collections' ? 'active' : 'inactive'" icon="pi pi-folder"
        :label="isMobile ? undefined : 'Collections'" @click="changeRoute('collections')"
      />
    </div>
  </div>
</template>

<style scoped>
.inactive {
  background-color: var(--p-primary-200) !important;
  border-color: var(--p-primary-200) !important;
}
</style>
