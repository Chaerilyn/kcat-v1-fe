<script setup lang="ts">
// @/components/CardSingleContent.vue
import type { ContentsItem } from '@/interfaces/typesContents'
import { useToast } from 'primevue/usetoast'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps<{
  content: ContentsItem
}>()

const toast = useToast()

const router = useRouter()

const likeCount = computed(() => {
  if (props.content.expand?.likes)
    return `${props.content.expand.likes.length}`
  else
    return `0`
})

// Computed
const contentUrl = computed(() =>
  props.content.file
    ? `${import.meta.env.VITE_HOST_URL}/${props.content.collectionId}/${props.content.id}/${props.content.file}`
    : props.content.kpfhdFile,
)

function isVideo(file: string) {
  return file && /\.(mp4|webm|ogg)$/i.test(file)
}

async function copyMirror(mirror: any) {
  await navigator.clipboard.writeText(mirror)
  toast.add({ severity: 'info', summary: 'Copied!', detail: 'Mirror copied to clipboard.', life: 1000 })
}

function goToSet(id: any) {
  router.push(`/set/${id}`)
}

function goToCollection(id: any) {
  router.push(`/collection/${id}`)
}

function openDiscord() {
  window.location.href = `discord://${props.content.discord}`
}

function openMirror() {
  window.open(`${props.content.mirror}`, '_blank')
}

function openSource() {
  window.open(`${props.content.source}`, '_blank')
}
</script>

<template>
  <div class="flex flex-col sm:flex-row gap-6">
    <div class="flex-1 hover:brightness-110 transition duration-300">
      <div v-if="isVideo(contentUrl)">
        <a :href="contentUrl">
          <video class="rounded-md w-full" autoplay muted loop @loadeddata="onMediaLoaded">
            <source :src="contentUrl" type="video/mp4">
          </video>
        </a>
      </div>
      <div v-else>
        <a :href="contentUrl">
          <img class="rounded-md w-full" :src="contentUrl" alt="pic" @load="onMediaLoaded">
        </a>
      </div>
    </div>

    <div class="flex-1">
      <h1 class="text-4xl font-bold" style="color: var(--p-primary-400)">
        METADATA
      </h1>
      <div class="mb-2">
        <h2 class="text-2xl">
          Idols
        </h2>
        <Tag
          v-for="idol in content.expand?.idol"
          :key="idol.id"
          icon="pi pi-star" severity="warning" :value="idol.name"
          class="select-none cursor-pointer hover:!bg-red-900 mr-2 mt-1" @click="filtersApply(idol, 'idol')"
        />
      </div>
      <div class="mb-2">
        <h2 class="text-2xl">
          Groups
        </h2>
        <Tag
          v-for="group in content.expand?.group"
          :key="group.id"
          icon="pi pi-at" severity="info" :value="group.name"
          class="select-none cursor-pointer hover:!bg-blue-900 mr-2 mt-1" @click="filtersApply(group, 'group')"
        />
      </div>
      <div class="mb-2">
        <h2 class="text-2xl">
          Tags
        </h2>
        <div v-if="content.expand?.tag">
          <Tag
            v-for="tag in content.expand?.tag"
            :key="tag.id"
            icon="pi pi-tags" severity="secondary" :value="tag.name"
            class="select-none cursor-pointer hover:!bg-zinc-700 mr-2 mt-1" @click="filtersApply(tag, 'tag')"
          />
        </div>
        <div v-else>
          <i class="pi pi-times text-slate-400" />
        </div>
      </div>
      <div class="mb-2">
        <h2 class="text-2xl">
          Uploader
        </h2>
        <div v-if="content.expand?.uploader" class="inline">
          <Tag
            v-for="uploader in content.expand.uploader"
            :key="uploader.id"
            :severity="uploader.isFeatured ? 'warn' : 'success'"
            :icon="uploader.isFeatured ? 'pi pi-crown' : 'pi pi-user'"
            :value="uploader.name"
            class="mt-1 select-none cursor-pointer" :class="[uploader.isFeatured ? 'hover:!bg-yellow-900' : 'hover:!bg-green-900']"
            @click="filtersApply(uploader, 'uploader')"
          />
        </div>
        <div v-else>
          <Tag
            severity="secondary"
            icon="pi pi-user"
            value="Moderator"
            class="mt-1 select-none hover:!bg-slate-500"
          />
        </div>
      </div>
      <div class="mb-2">
        <h2 class="text-2xl">
          Set
        </h2>
        <div v-if="content.expand?.set">
          <Tag
            icon="pi pi-folder" severity="success" :value="content.expand?.set?.title"
            class="select-none cursor-pointer hover:!bg-green-900 mr-2 mt-1" @click="goToSet(content.set)"
          />
        </div>
        <div v-else>
          <i class="pi pi-times text-slate-400" />
        </div>
      </div>
      <div class="mb-2">
        <h2 class="text-2xl">
          Created
        </h2>
        <Tag
          id="p-custom-datetag"
          icon="pi pi-calendar" :value="new Date(content.created).toISOString().split('T')[0]"
          class="select-none mt-1" severity="contrast"
        />
      </div>
      <div class="mb-2">
        <h2 class="text-2xl">
          Content Date <em class="text-sm">{{ content.date ? ' (Inherited from created)' : '' }}</em>
        </h2>
        <Tag
          id="p-custom-datetag"
          icon="pi pi-calendar" :value="new Date(content.date).toISOString().split('T')[0]"
          class="select-none mt-1" severity="contrast"
        />
      </div>
      <div class="mb-2">
        <h2 class="text-2xl">
          Origin
        </h2>
        <Tag
          icon="pi pi-cloud-upload" severity="secondary" :value="content.origin ? content.origin : 'Kpopcat Direct Upload'"
          class="select-none cursor-pointer hover:!bg-zinc-700 mr-2 mt-1"
        />
      </div>
      <div class="mb-2">
        <h2 class="text-2xl">
          External Links
        </h2>
        <div class="flex gap-2 mt-1">
          <Button icon="pi pi-copy" label="Mirror" :disabled="!content.mirror" severity="help" @click="openMirror" />
          <Button icon="pi pi-discord" label="Discord" :disabled="!content.discord" severity="help" @click="openDiscord" />
          <Button icon="pi pi-link" label="Source" :disabled="!content.source" severity="help" @click="openSource" />
        </div>
      </div>
      <div class="mb-2">
        <h2 class="text-2xl">
          Likes
        </h2>
        <Tag
          icon="pi pi-heart-fill" severity="danger" :value="likeCount"
          class="select-none hover:!bg-zinc-700 mr-2 mt-1"
        />
      </div>
      <div class="mb-2">
        <h2 class="text-2xl">
          Appears In
        </h2>
        <div v-if="content.expand?.collections">
          <Tag
            v-for="collection in content.expand.collections"
            :key="collection.id"
            icon="pi pi-folder" severity="success" :value="collection.title"
            class="select-none cursor-pointer hover:!bg-green-900 mr-2 mt-1" @click="goToCollection(collection.id)"
          />
        </div>
        <div v-else>
          <i class="pi pi-times text-slate-400" />
        </div>
      </div>
    </div>
  </div>
</template>
