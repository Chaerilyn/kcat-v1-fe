<script setup lang="ts">
import type { ContentsItem } from '@/interfaces/typesContents'
import { computed } from 'vue'

// Setup
const props = defineProps<{
  isVisible: boolean
  content: ContentsItem
}>()

const emit = defineEmits([
  'update:isVisible',
])

function handleVisibilityChange(value: boolean) {
  emit('update:isVisible', value)
}

function isVideo(file: string) {
  return file && /\.(mp4)$/i.test(file)
}

// Computed
const contentUrl = computed(() =>
  props.content.file
    ? `${import.meta.env.VITE_HOST_URL}/${props.content.collectionId}/${props.content.id}/${props.content.file}`
    : props.content.kpfhdFile,
)

function handleHide() {
  emit('update:isVisible', false)
}
</script>

<template>
  <Dialog
    :visible="isVisible"
    dismissable-mask
    modal
    :closable="false"
    :show-header="false"
    @update:visible="handleVisibilityChange"
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
</template>
