<script setup lang="ts">
import type { ContentsItem } from '@/interfaces/typesContents'
import { storeAuth } from '@/stores/storeAuth'
import PocketBase from 'pocketbase'
import { useToast } from 'primevue/usetoast'
import { onMounted, ref } from 'vue'

const props = defineProps<{
  isVisible: boolean
  content: ContentsItem
}>()

const emit = defineEmits([
  'update:isVisible',
])

const newCollection = ref({
  name: '',
  isPublic: true,
})

const originalCollectionIds = ref<string[]>([])
const selectedCollections = ref<string[]>([])
const collections = ref<Collection[]>([])
const toast = useToast()

const isCreateCollectionVisible = ref<boolean>(false)

const authStore = storeAuth()
const pb = new PocketBase(import.meta.env.VITE_BASE_URL)

onMounted(async () => {
  await fetchCollections()
  originalCollectionIds.value = props.content.collections || []
  selectedCollections.value = [...originalCollectionIds.value] // Initialize with original collections
})

async function fetchCollections() {
  try {
    const userId = pb.authStore?.record?.id
    if (!userId) {
      throw new Error('User is not authenticated.')
    }
    const response = await pb.collection('contents_collections').getList(1, 50, {
      filter: `user?~"${userId}"`,
    })
    collections.value = response.items
  }
  catch (error) {
    console.error('Error fetching user collections:', error)
    toast.add({ severity: 'error', summary: 'Fetch Error', detail: 'Failed to fetch collections.', life: 3000 })
  }
}

async function updateContentCollections(addedCollections, removedCollections) {
  const contentId = props.content.id // Ensure you have access to the content ID
  try {
    // Append new collections
    if (addedCollections.length > 0) {
      await pb.collection('contents').update(contentId, {
        'collections+': addedCollections,
      })
    }

    // Remove old collections
    if (removedCollections.length > 0) {
      await pb.collection('contents').update(contentId, {
        'collections-': removedCollections,
      })
    }

    toast.add({ severity: 'success', summary: 'Updated!', detail: 'Collections updated successfully.', life: 3000 })
    handleVisibilityChange(false)
  }
  catch (error) {
    console.error('Error updating collections:', error)
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to update collections.', life: 3000 })
  }
}

// Save collections changes
async function handleSaveCollections() {
  const addedCollections = selectedCollections.value.filter(id => !originalCollectionIds.value.includes(id))
  const removedCollections = originalCollectionIds.value.filter(id => !selectedCollections.value.includes(id))

  await updateContentCollections(addedCollections, removedCollections)
  // Update originalCollectionIds to reflect the current state after changes
  originalCollectionIds.value = [...selectedCollections.value]
}

async function collectionSave() {
  try {
    const userId = pb.authStore?.record?.id
    if (!userId) {
      throw new Error('User is not authenticated.')
    }

    const data = {
      title: newCollection.value.name,
      user: userId,
      isPublic: newCollection.value.isPublic,
    }

    await pb.collection('contents_collections').create(data)

    isCreateCollectionVisible.value = false
    newCollection.value.name = ''
    newCollection.value.isPublic = true

    await fetchCollections()

    toast.add({ severity: 'success', summary: 'Collection Created', detail: 'New collection created successfully.', life: 3000 })
  }
  catch (error) {
    console.error('Error creating collection:', error)
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to create collection.', life: 3000 })
  }
}

function handleVisibilityChange(value: boolean) {
  emit('update:isVisible', value)
}

function handleHide() {
  emit('update:isVisible', false)
}
</script>

<template>
  <Dialog
    dismissable-mask
    :visible="isVisible"
    modal
    header="Add To Collection"
    :style="{ width: '25rem' }"
    @hide="handleHide"
    @update:visible="handleVisibilityChange"
  >
    <Button type="button" label="New Collection" severity="contrast" class="mb-3" fluid @click="isCreateCollectionVisible = true" />
    <Listbox v-model="selectedCollections" :options="collections" option-label="title" option-value="id" multiple class="w-full" />
    <div class="flex gap-4 mt-8">
      <Button type="button" label="Cancel" severity="secondary" fluid @click="handleHide" />
      <Button type="button" label="Save" severity="success" fluid @click="handleSaveCollections" />
    </div>
  </Dialog>

  <Dialog v-model:visible="isCreateCollectionVisible" modal header="Create Collection" :style="{ width: '25rem' }">
    <div class="flex flex-col items-center gap-2">
      <label for="filtername" class="font-semibold text-center">Collection Name</label>
      <InputText id="filtername" v-model="newCollection.name" class="flex-auto" autocomplete="off" />

      <label for="ispublic" class="font-semibold text-center">Is public</label>
      <Checkbox id="ispublic" v-model="newCollection.isPublic" :binary="true" />
    </div>
    <div class="flex gap-4 mt-8">
      <Button type="button" label="Cancel" severity="secondary" fluid @click="isCreateCollectionVisible = false" />
      <Button type="button" label="Save" severity="success" fluid @click="collectionSave" />
    </div>
  </Dialog>
</template>
