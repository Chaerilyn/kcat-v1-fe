<script setup lang="ts">
// @/components/CardBaseContent.vue
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
  'filtersApply',
])

// Types
type FilterValue = Idol | Group | Uploader | Tag

const toast = useToast()
const router = useRouter()

const filtersStore = storeFilters()
const settingsStore = storeSettings()

const isSpeedDialOpen = ref(false)

const {
  isLiked,
  likeContent,
  initializeLikeState,
} = useLikeItem(props.content)

// Refs
const items = ref<MenuItem[]>([])
const loaded = ref(false)

// Computed
const contentUrl = computed(() =>
  props.content.file
    ? `${import.meta.env.VITE_HOST_URL}/${props.content.collectionId}/${props.content.id}/${props.content.file}`
    : props.content.kpfhdFile,
)

const likeIcon = computed(() => {
  return isLiked.value ? 'pi pi-heart-fill' : 'pi pi-heart'
})

const likeCount = computed(() => {
  if (props.content.expand?.likes)
    return `${props.content.expand.likes.length}`
  else
    return `0`
})

// Modals
const isAddToCollectionVisible = ref(false)
function collectionsOpen() {
  isAddToCollectionVisible.value = true
}
const isFullscreenModalVisible = ref(false)
function contentOpen() {
  isFullscreenModalVisible.value = true
}

// Functions
function onMediaLoaded() {
  loaded.value = true
}

function isVideo(file: string) {
  return file && /\.(mp4)$/i.test(file)
}

function goToSet(id: string | number) {
  router.push({ name: 'set', params: { id } }).catch((err) => {
    console.error('Navigation error:', err)
  })
}

async function copyMirror(mirror: any) {
  await navigator.clipboard.writeText(mirror)
  toast.add({ severity: 'info', summary: 'Copied!', detail: 'Mirror link copied to clipboard.', life: 1000 })
}

async function copyOriginal() {
  const originalUrl = `${import.meta.env.VITE_HOST_URL}/${props.content.collectionId}/${props.content.id}/${props.content.file}`
  try {
    await navigator.clipboard.writeText(originalUrl)
    toast.add({ severity: 'info', summary: 'Copied!', detail: 'Original link copied to clipboard.', life: 1000 })
  }
  catch (error) {
    console.error('Failed to copy the link:', error)
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to copy the link.', life: 3000 })
  }
}

function filtersApply(value: FilterValue, type: 'idol' | 'group' | 'uploader' | 'tag') {
  filtersStore.filtersReset()

  if (type === 'idol') {
    const idol = filtersStore.idols.find((idol: Idol) => idol.name === value.name)
    if (idol) {
      filtersStore.filters.idol.push(idol)
    }
  }
  else if (type === 'group') {
    const group = filtersStore.groups.find((group: Group) => group.name === value.name)
    if (group) {
      filtersStore.filters.group.push(group)
    }
  }
  else if (type === 'uploader') {
    const uploader = filtersStore.uploaders.find((uploader: Uploader) => uploader.name === value.name)
    if (uploader) {
      filtersStore.filters.uploader.push(uploader)
    }
  }
  else if (type === 'tag') {
    const tag = filtersStore.tags.find((tag: Tag) => tag.name === value.name)
    if (tag) {
      filtersStore.filters.tag.push(tag)
    }
  }

  filtersStore.filtersSave()

  emit('filtersApply')
}

function downloadFile(url) {
  const a = document.createElement('a')
  a.href = url
  a.download = props.content.file.split('/').pop()
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

function initializeItems() {
  items.value.push(
    {
      label: 'Add To Collection',
      icon: 'pi pi-plus',
      command: () => {
        collectionsOpen()
      },
    },
    {
      label: 'Copy Original Link',
      icon: 'pi pi-file',
      command: () => {
        copyOriginal(props.content.file)
      },
    },
    {
      label: 'Download',
      icon: 'pi pi-download',
      command: () => {
        const downloadUrl = `${import.meta.env.VITE_HOST_URL}/${props.content.collectionId}/${props.content.id}/${props.content.file}?download=1`
        downloadFile(downloadUrl)
      },
    },
  )

  if (props.content.source && props.content.source.trim() !== '') {
    items.value.push(
      {
        label: 'Go To Source',
        icon: 'pi pi-link',
        command: () => {
          window.open(`${props.content.source}`, '_blank')
        },
      },
    )
  }

  if (props.content.mirror && props.content.mirror.trim() !== '') {
    items.value.push(
      {
        label: 'Copy Mirror Link',
        icon: 'pi pi-copy',
        command: () => {
          copyMirror(props.content.mirror)
        },
      },
    )
  }

  if (props.content.discord && props.content.discord.trim() !== '') {
    items.value.push(
      {
        label: 'Go To Discord Message',
        icon: 'pi pi-discord',
        command: () => {
          window.location.href = `discord://${props.content.discord}`
        },
      },
    )
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
  initializeItems()
  initializeLikeState()
})
</script>

<template>
  <div v-show="loaded">
    <div class="p-2.5 rounded-md relative" :class="backgroundColor">
      <div v-if="settingsStore.settings.noDistractionMode === 'Disabled'" class="flex items-center gap-1 mb-2.5">
        <router-link :to="`/single/${content.id}`" class="flex-1 truncate">
          <h3 class="hover:text-rose-400">
            {{ content.title }}
          </h3>
        </router-link>
        <div class="flex-shrink-0 flex gap-2">
          <div v-if="content.expand?.uploader" class="inline">
            <Tag
              v-for="uploader in content.expand.uploader"
              :key="uploader.id"
              :severity="uploader.isFeatured ? 'warn' : 'success'"
              :rounded="true"
              :icon="uploader.isFeatured ? 'pi pi-crown' : 'pi pi-user'"
              :value="uploader.name"
              class="select-none cursor-pointer" :class="[uploader.isFeatured ? 'hover:!bg-yellow-900' : 'hover:!bg-green-900']"
              @click="filtersApply(uploader, 'uploader')"
            />
          </div>
          <div v-if="content.set" class="inline">
            <Tag
              severity="secondary" rounded icon="pi pi-arrow-up-right" value="Set"
              class="select-none cursor-pointer hover:!bg-zinc-700" @click="goToSet(content.set)"
            />
          </div>
          <div class="inline-block w-11 h-4 mb-1">
            <SpeedDial
              id="p-custom-options"
              :model="items" direction="down" :rotate-animation="false"
              :tooltip-options="{ position: 'left' }"
              @show="isSpeedDialOpen = true"
              @hide="isSpeedDialOpen = false"
            >
              <template #icon="">
                <i :class="isSpeedDialOpen ? 'pi pi-chevron-up' : 'pi pi-chevron-down'" />
              </template>
            </SpeedDial>
          </div>
        </div>
      </div>
      <div class="relative hover:brightness-110 transition duration-300" @click.stop.prevent="contentOpen">
        <div v-if="isVideo(contentUrl)">
          <a :href="contentUrl">
            <video class="block w-full rounded-md" :autoplay="settingsStore.settings.dataSavingMode === 'Disabled'" muted loop width="250" @loadeddata="onMediaLoaded">
              <source :src="contentUrl" type="video/mp4">
            </video>
            <div v-if="settingsStore.settings.noDistractionMode === 'Disabled'">
              <div
                v-if="content.isQuality"
                class="absolute top-0 right-0 bg-yellow-500 opacity-75 text-white text-xs px-1 py-0.5 rounded-bl-sm rounded-tr-sm shadow-sm"
              >
                HQ
              </div>
              <div
                v-else
                class="absolute top-0 right-0 bg-gray-500 opacity-75 text-white text-xs px-1 py-0.5 rounded-bl-sm rounded-tr-sm shadow-sm"
              >
                LQ
              </div>
            </div>

            <div v-if="settingsStore.settings.dataSavingMode === 'Enabled'" class="absolute top-0 left-0 w-full h-full flex items-center justify-center">
              <i class="pi pi-play-circle !text-5xl opacity-50" />
            </div>
          </a>
        </div>
        <div v-else>
          <a :href="contentUrl">
            <img class="rounded-md w-full" :src="contentUrl" alt="pic" @load="onMediaLoaded">
          </a>
        </div>
        <Button
          v-if="settingsStore.settings.noDistractionMode === 'Disabled'"
          id="p-like-button" :badge="likeCount" severity="contrast" badge-severity="contrast"
          :icon="likeIcon" class="z-10 hover:!opacity-100 !transition !duration-300" @click.stop.prevent="likeContent"
        />
      </div>
      <div v-if="settingsStore.settings.noDistractionMode === 'Disabled'" class="flex justify-between mt-0.5">
        <div class="flex flex-wrap flex-1">
          <Tag
            v-for="idol in content.expand?.idol"
            :key="idol.id"
            icon="pi pi-star" severity="warning" :value="idol.name"
            class="select-none cursor-pointer hover:!bg-red-900 mr-2 mt-2" @click="filtersApply(idol, 'idol')"
          />
          <Tag
            v-for="group in content.expand?.group"
            :key="group.id"
            icon="pi pi-at" severity="info" :value="group.name"
            class="select-none cursor-pointer hover:!bg-blue-900 mr-2 mt-2" @click="filtersApply(group, 'group')"
          />
          <Tag
            v-for="tag in content.expand?.tag"
            :key="tag.id"
            icon="pi pi-tags" severity="secondary" :value="tag.name"
            class="select-none cursor-pointer hover:!bg-zinc-700 mr-2 mt-2" @click="filtersApply(tag, 'tag')"
          />
        </div>
        <div
          v-if="content.date" v-tooltip.top="`Created: ${new Date(content.created).toISOString().split('T')[0]
          } Actual: ${new Date(content.date).toISOString().split('T')[0]}`"
        >
          <Tag
            id="p-custom-datetag"
            icon="pi pi-history"
            class="select-none cursor-help mt-2" severity="secondary"
          />
          <Tag
            id="p-custom-datetag"
            icon="pi pi-calendar" :value="new Date(content.date).toISOString().split('T')[0]"
            class="select-none cursor-help mt-2" severity="contrast"
          />
        </div>
        <div
          v-else-if="content.created" v-tooltip.top="`Created: ${new Date(content.created).toISOString().split('T')[0]
          } Actual: Inherited`"
        >
          <Tag
            id="p-custom-datetag"
            icon="pi pi-calendar" :value="new Date(content.created).toISOString().split('T')[0]"
            class="select-none cursor-help mt-2" severity="secondary"
          />
        </div>
      </div>
    </div>
  </div>
  <div v-if="loaded" />
  <div v-else>
    <SkeletonBaseContent />
  </div>

  <div v-if="isFullscreenModalVisible">
    <DialogBaseFullscreen :is-visible="isFullscreenModalVisible" :content="content" @update:is-visible="isFullscreenModalVisible = $event" />
  </div>

  <div v-if="isAddToCollectionVisible">
    <QuickCollectionModal :is-visible="isAddToCollectionVisible" :content="content" @update:is-visible="isAddToCollectionVisible = $event" />
  </div>
</template>

<style>
.p-speeddial-button {
  height: 26px !important;
  border-radius: 12px !important;
  background: var(--p-tag-primary-background) !important;
  border: none !important;
  color: var(--p-tag-primary-color) !important;
}

#p-like-button {
  position: absolute !important;
  bottom: 8px;
  right: 8px;

  padding: 2px 8px;

  color: #FF0000 !important;
  gap: 0;
  opacity: 0.5;
}

#p-custom-datetag {
  font-size: 8px !important;
  font-weight: 400;
  padding: 6.5px;
}

.stack-effect {
  position: relative;
  background: #0f172a;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 8px 16px rgba(0,0,0,0.25);
}

.stack-effect::before {
  content: "";
  position: absolute;
  width: 100%;
  height: 100%;
  background: #0f172a;
  border-radius: 8px;
  z-index: -1;
}

.stack-effect::before {
  transform: translate(5px, 5px);
}
</style>
