<script setup lang="ts">
// @/components/StackedContentCard.ts
import type { CollectionsItem } from '@/interfaces/typesCollections'
import type { Group, Idol, Tag, Uploader } from '@/interfaces/typesCommon'
import type { SetsItem } from '@/interfaces/typesSets'
import type { MenuItem } from 'primevue/menuitem'
import type { Ref } from 'vue'
import { storeFilters } from '@/stores/storeFilters'
import { useToast } from 'primevue/usetoast'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps<{
  content: SetsItem | CollectionsItem
  isSet: boolean
}>()

const emit = defineEmits([
  'filtersApply',
])

const isVisible = ref(false)

function contentOpen() {
  isVisible.value = true
}

const routePath = computed(() => {
  return props.isSet ? `/set/${props.content.id}` : `/collection/${props.content.id}`
})

const filtersStore = storeFilters()
const toast = useToast()
const router = useRouter()

const getContentUrls = computed(() => {
  // 1) Determine the correct field based on whether the content is from a set or a collection.
  const contentField = props.isSet ? 'contents_via_set' : 'contents_via_collections'

  // 2) Safely check if expand exists and has the correct field.
  const expandObj = props.content?.expand
  if (!expandObj || !expandObj[contentField]) {
    return []
  }

  // 3) Slice up to 4 items
  const items = expandObj[contentField].slice(0, 4)

  // 4) Map each item to a display object
  return items.map((item) => {
    // If item.file is present, build from environment URL; otherwise use item.kpfhdFile
    const baseUrl = item.file
      ? `${import.meta.env.VITE_HOST_URL}/${item.collectionId}/${item.id}/${item.file}`
      : item.kpfhdFile // fallback if item.file is empty

    // If using item.file, append "?thumb=250x250"
    const finalUrl = item.file
      ? `${baseUrl}?thumb=250x250`
      : baseUrl

    return {
      url: finalUrl,
      isVideo: isVideo(baseUrl),
    }
  })
})

function isVideo(file: string) {
  return file && /\.(mp4|webm|ogg)$/i.test(file)
}

function goToSingle(id: string) {
  // Save the title to localStorage
  localStorage.setItem('pageTitle', props.content.title)

  // Navigate to the appropriate route
  if (props.isSet) {
    router.push(`/set/${id}`)
  }
  else {
    router.push(`/collection/${id}`)
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

async function copyMirror(mirror: any) {
  await navigator.clipboard.writeText(mirror)
  toast.add({ severity: 'info', summary: 'Copied!', detail: 'Mirror link copied to clipboard.', life: 1000 })
}

async function copyOriginal(original: any) {
  await navigator.clipboard.writeText(original)
  toast.add({ severity: 'info', summary: 'Copied!', detail: 'Original link copied to clipboard.', life: 1000 })
}

function applyFilter(value: string, type: string) {
  emit('filterApply', { type, value: value.trim() })
}

const items: Ref<MenuItem[]> = ref([])

function initializeItems() {
  items.value.push(
    {
      label: 'Copy Original',
      icon: 'pi pi-copy',
      command: () => {
        copyOriginal(props.content.file)
      },
    },
  )

  if (props.content.source && props.content.source.trim() !== '') {
    items.value.push(
      {
        label: 'Open Source',
        icon: 'pi pi-link',
        command: () => {
          window.location.href = `${props.content.source}`
        },
      },
    )
  }

  if (props.content.mirror && props.content.mirror.trim() !== '') {
    items.value.push(
      {
        label: 'Copy Mirror',
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
        label: 'Open Discord Message',
        icon: 'pi pi-discord',
        command: () => {
          window.location.href = `discord://${props.content.discord}`
        },
      },
    )
  }
}

initializeItems()
</script>

<template>
  <div class="pt-3 pb-3 px-2 rounded-md bg-[#0f172a] relative stack-effect">
    <div class="flex items-center gap-2 mb-2">
      <div class="flex-1 truncate" @click="goToSingle(content.id)">
        <h3 class="hover:text-rose-400 cursor-pointer">
          {{ content.title }}
        </h3>
      </div>
      <div class="flex-shrink-0 flex gap-2">
        <div v-if="content.expand.uploader" class="inline">
          <Tag
            v-for="uploader in content.expand.uploader"
            :key="uploader.id"
            severity="success" rounded icon="pi pi-user" :value="uploader.name"
            class="select-none cursor-pointer hover:!bg-green-900" @click="filtersApply(uploader, 'uploader')"
          />
        </div>
        <div v-else-if="content.expand.user" class="inline">
          <Tag
            v-for="user in content.expand.user"
            :key="user.id"
            severity="success" rounded icon="pi pi-user" :value="user.name.split('#')[0]"
            class="select-none"
          />
        </div>
        <!-- <div class="inline-block w-11 h-4 mb-1">
          <SpeedDial
            id="p-custom-options"
            :model="items" direction="down" :rotate-animation="false"
          />
        </div> -->
      </div>
    </div>
    <div class="cursor-pointer" @click="goToSingle(content.id)">
      <div v-if="!content.cover">
        <div class="grid grid-cols-2 gap-4 hover:brightness-110 transition duration-300">
          <div v-for="(content, index) in getContentUrls" :key="index" class="w-full">
            <div v-if="content.isVideo">
              <video class="w-full h-auto rounded-md">
                <source :src="content.url" type="video/mp4">
                Your browser does not support the video tag.
              </video>
            </div>
            <div v-else>
              <img class="w-full h-auto rounded-md" :src="content.url" alt="Content preview">
            </div>
          </div>
        </div>
      </div>
      <div v-else>
        <img class="w-full h-auto rounded-md" :src="content.cover" alt="Content preview">
      </div>
    </div>
    <div class="flex justify-between">
      <div class="flex flex-wrap flex-1">
        <Tag
          v-for="idol in content.expand.idol"
          v-if="content.idol" :key="idol.id"
          icon="pi pi-star" severity="warn" :value="idol.name"
          class="select-none cursor-pointer hover:!bg-orange-900 mr-2 mt-2" @click="filtersApply(idol, 'idol')"
        />
        <Tag
          v-for="group in content.expand.group"
          v-if="content.group" :key="group.id"
          icon="pi pi-at" severity="info" :value="group.name"
          class="select-none cursor-pointer hover:!bg-blue-900 mr-2 mt-2" @click="filtersApply(group, 'group')"
        />
        <Tag
          v-for="tag in content.expand.tag"
          v-if="content.tag" :key="tag.id"
          icon="pi pi-tags" severity="secondary" :value="tag.name"
          class="select-none cursor-pointer hover:!bg-zinc-700 mr-2 mt-2"
          @click="filtersApply(tag, 'tag')"
        />
      </div>
      <div v-if="content.created">
        <Tag
          id="p-custom-datetag"
          icon="pi pi-calendar" :value="new Date(content.created).toISOString().split('T')[0]"
          class="select-none mt-2" severity="secondary"
        />
      </div>
    </div>
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
}

#p-custom-datetag {
  font-size: 8px !important;
  font-weight: 400;
  padding: 6.5px;
}

.stack-effect {
  position: relative;
  background: #0f172a; /* Dark background color */
  border-radius: 8px; /* Rounded corners */
  padding: 12px; /* Padding for content */
  box-shadow: 0 8px 16px rgba(0,0,0,0.25); /* Shadow for depth */
}

.stack-effect::before {
  content: "";
  position: absolute;
  width: 100%; /* Match the width of the parent */
  height: 100%; /* Match the height of the parent */
  background: #1e2841; /* Same background color */
  border-radius: 8px; /* Match border radius */
  z-index: -1; /* Sit behind the parent div */
}

.stack-effect::before {
  transform: translate(2px, 2px); /* Slight offset for the first layer */
}
</style>
