<script setup lang="ts">
// @/components/CardToolsContent.vue
import type { Group, Idol, Tag, Uploader } from '@/interfaces/typesCommon'
import type { ContentsItem } from '@/interfaces/typesContents'
import type { MenuItem } from 'primevue/menuitem'
import { useLikeItem } from '@/composables/useLikeItem'
import { storeFilters } from '@/stores/storeFilters'
import { storeSettings } from '@/stores/storeSettings'
import { useToast } from 'primevue/usetoast'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

// Setup
const props = defineProps<{
  content: ContentsItem
}>()

const emit = defineEmits([
  'downloadFile',
])

// Types
type FilterValue = Idol | Group | Uploader | Tag

const toast = useToast()
const router = useRouter()

const filtersStore = storeFilters()
const settingsStore = storeSettings()

const {
  isLiked,
  initializeLikeState,
} = useLikeItem(props.content)

// Refs

// Computed
const contentUrl = computed(() =>
  props.content.file
    ? `${import.meta.env.VITE_HOST_URL}/${props.content.collectionId}/${props.content.id}/${props.content.file}`
    : props.content.kpfhdFile,
)

// Modals
const isFullscreenModalVisible = ref(false)
function contentOpen() {
  isFullscreenModalVisible.value = true
}

function isVideo(file: string) {
  return file && /\.(mp4)$/i.test(file)
}

// Emit file download event
function emitDownload() {
  emit('downloadFile', contentUrl.value)
}

// Emit file download event
async function copyLink() {
  try {
    await navigator.clipboard.writeText(contentUrl.value)
    // Optional: Display a success message to the user
    toast.add({ severity: 'success', summary: 'Copied!', detail: 'Text copied to clipboard.', life: 2000 })
  }
  catch (err) {
    console.error('Failed to copy text: ', err)
    // Optional: Display an error message to the user
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to copy text.', life: 2000 })
  }
}

const backgroundColor = computed(() => {
  if (props.content.isQuality) {
    return 'bg-[#0f172a]'
  }
  else {
    return 'bg-[#0f172a]'
  }
})

// Lifecycle
onMounted(async () => {
  filtersStore.filtersLoad()
  initializeLikeState()
})
</script>

<template>
  <div>
    <div class="p-2.5 rounded-md relative data-tilt" :class="backgroundColor">
      <div class="flex items-center gap-1 mb-2.5">
        <router-link :to="`/single/${content.id}`" class="flex-1 truncate">
          <h3 class="hover:text-rose-400">
            {{ content.title }}
          </h3>
        </router-link>
      </div>
      <div class="relative hover:brightness-110 transition duration-300" @click.stop.prevent="contentOpen">
        <div v-if="isVideo(contentUrl)">
          <a :href="contentUrl">
            <video class="block w-full rounded-md" :autoplay="settingsStore.settings.dataSavingMode === 'Disabled'" muted loop width="250">
              <source :src="contentUrl" type="video/mp4">
            </video>

            <div v-if="settingsStore.settings.dataSavingMode === 'Enabled'" class="absolute top-0 left-0 w-full h-full flex items-center justify-center">
              <i class="pi pi-play-circle !text-5xl opacity-50" />
            </div>
          </a>
        </div>
        <div v-else>
          <a :href="contentUrl">
            <img class="rounded-md w-full" :src="contentUrl" alt="pic">
          </a>
        </div>
        <div class="flex">
          <Button
            severity="contrast" label="Download" class="w-full mt-2"
            @click.stop.prevent="emitDownload"
          />
          <Button
            severity="contrast" label="Copy" class="w-full mt-2"
            @click.stop.prevent="copyLink"
          />
        </div>
      </div>
    </div>
  </div>

  <div v-if="isFullscreenModalVisible">
    <Dialog
      v-model:visible="isFullscreenModalVisible"
      dismissable-mask
      modal
      :closable="false"
      :show-header="false"
      :style="{ height: '100vh' }"
    >
      <div class="max-h-[90vh] overflow-y-auto pt-5">
        <div v-if="isVideo(contentUrl)">
          <a :href="contentUrl">
            <video class="block w-full rounded-md" autoplay muted loop style="max-height: 85vh">
              <source :src="contentUrl" type="video/mp4">
            </video>
          </a>
        </div>
        <div v-else>
          <a :href="contentUrl">
            <img class="rounded-md w-full" style="max-height: 85vh" :src="contentUrl" alt="pic">
          </a>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<style scoped>
</style>
