<script setup lang="ts">
import type { ContentsItem } from '@/interfaces/typesContents'

const props = defineProps<{
  content: ContentsItem
}>()
</script>

<template>
  <div class="mx-auto my-4 gap-2 flex items-center">
    <Button :label="props.contentUnpaginated.uploader || 'none'" icon="pi pi-user" class="w-full h-8" outlined />
    <Button :label="props.contentUnpaginated.title || 'none'" icon="pi pi-tag" class="w-full h-8" outlined />
    <Button
      :label="props.contentUnpaginated.date ? props.contentUnpaginated.date.split(' ')[0] : 'none'" icon="pi pi-calendar"
      class="w-full h-8" outlined
    />
  </div>
</template>
