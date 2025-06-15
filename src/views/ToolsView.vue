<script setup lang="ts">
import CardToolsContent from '@/components/CardToolsContent.vue'
import { useWindowSize } from '@/composables/useWindowSize'
import { storeSettings } from '@/stores/storeSettings'
import PocketBase from 'pocketbase'
import { useToast } from 'primevue/usetoast'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const baseUrl = import.meta.env.VITE_BASE_URL
const pb = new PocketBase(baseUrl)

const toast = useToast()
const router = useRouter()
const route = useRoute()

// Modals
const isBaseSettingsDialogVisible = ref(false)
function optionsOpen() {
  isBaseSettingsDialogVisible.value = true
}

const {
  isMobile,
} = useWindowSize()

// Reactive properties
const rawInput = ref('')
const items = ref<any[]>([])
const recordId = ref<string | null>(null)
const isOwner = ref(false)

// Settings store
const settingsStore = storeSettings()

// Computed property to dynamically split the input
const inputLinks = computed({
  get: () => rawInput.value,
  set: (value: string) => {
    rawInput.value = value
      .split(/[\s,]+/)
      .filter(link => link.trim())
      .join('\n')
  },
})

// Normalize Imgur links
function normalizeLinks() {
  filterImgurLinks() // Remove non-Imgur links first

  rawInput.value = rawInput.value
    .split('\n')
    .map(link => link.trim())
    .map((link) => {
      if (link.startsWith('https://imgur.com/') && !link.endsWith('.mp4')) {
        const id = link.split('/').pop()
        return `https://i.imgur.com/${id}.mp4`
      }
      return link
    })
    .join('\n')
}

// Generate content items
function generateItems() {
  normalizeLinks()

  const idCounter = (() => {
    let id = 0
    return () => ++id
  })()

  items.value = inputLinks.value
    .split('\n')
    .map(link => link.trim())
    .filter(link => link.startsWith('https://i.imgur.com') && link.endsWith('.mp4'))
    .map(link => ({
      id: idCounter(),
      file: link,
      title: link,
    }))
}

// Filter Imgur links
function filterImgurLinks() {
  rawInput.value = rawInput.value
    .split('\n') // Split into lines
    .map(link => link.trim()) // Trim whitespace
    .filter(link => link.startsWith('https://imgur.com/') || link.startsWith('https://i.imgur.com/')) // Keep only Imgur links
    .join('\n') // Rejoin the lines
}

// Create a new PocketBase record
async function generateLink() {
  normalizeLinks()

  const userId = pb.authStore.model?.id
  if (!userId) {
    console.error('User is not authenticated.')
    return
  }

  const linksArray = inputLinks.value.split('\n').filter(link => link.trim())

  try {
    const record = await pb.collection('users_links').create({
      user: userId,
      title: 'Generated Link',
      links: linksArray,
    })

    router.push(`/tools/${record.id}`)
  }
  catch (error) {
    console.error('Failed to create PocketBase record:', error)
  }
}

// Update an existing PocketBase record
async function updateLink() {
  if (!recordId.value)
    return

  normalizeLinks()
  const linksArray = inputLinks.value.split('\n').filter(link => link.trim())

  try {
    await pb.collection('users_links').update(recordId.value, {
      links: linksArray,
    })

    toast.add({ severity: 'success', summary: 'Updated!', detail: 'Links updated successfully.', life: 2000 })
  }
  catch (error) {
    console.error('Failed to update PocketBase record:', error)
  }
}

// Fetch record by ID
async function fetchLinksById(id: string) {
  try {
    const record = await pb.collection('users_links').getOne(id)
    recordId.value = record.id
    rawInput.value = record.links.join('\n')
    generateItems()

    // Check if the current user is the owner
    const userId = pb.authStore.model?.id
    isOwner.value = userId === record.user
  }
  catch (error) {
    console.error('Failed to fetch PocketBase record:', error)
  }
}

// Download a single file
async function downloadFile(url) {
  try {
    const response = await fetch(url, { mode: 'cors' })
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }
    const blob = await response.blob()
    const blobUrl = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = blobUrl
    a.download = url.split('/').pop()
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    URL.revokeObjectURL(blobUrl)
  }
  catch (error) {
    console.error('File download failed:', error)
  }
}

// Download all links
async function downloadAll() {
  normalizeLinks()

  const links = inputLinks.value
    .split('\n')
    .map(link => link.trim())
    .filter(link => link.startsWith('https://i.imgur.com') && link.endsWith('.mp4'))

  for (const link of links) {
    await downloadFile(link)
  }
}

// Fetch record on component mount
onMounted(() => {
  const routeId = route.params.id
  if (routeId) {
    fetchLinksById(routeId as string)
  }
})
</script>

<template>
  <div>
    <div class="flex justify-start items-center">
      <NavigationBase class="mt-4 flex-1" />
      <Button v-if="!isMobile" icon="pi pi-cog" severity="secondary" class="ml-2" @click="optionsOpen" />
    </div>
    <div>
      <h1 class="text-4xl font-bold text-center mt-4" style="color: var(--p-primary-500)">
        Imgur Tools
      </h1>
      <p class="text-center text-lg mb-2 text-gray-400">
        Make a grid out of Imgur links, retrieve content from dead links, (mass) download content & generate shareable link.
      </p>
    </div>
    <div class="flex flex-col items-center justify-center">
      <div class="flex flex-col sm:flex-row gap-4 w-full sm:w-1/2">
        <!-- Textarea Container -->
        <FloatLabel variant="in" class="flex-grow">
          <Textarea
            id="over_label"
            v-model="inputLinks"
            rows="6"
            style="resize: none"
            class="w-full"
          />
          <label for="in_label">Imgur Links</label>
        </FloatLabel>

        <!-- Buttons -->
        <div class="flex flex-row sm:flex-col gap-2 justify-between mb-1.5">
          <Button
            label="Generate Content"
            icon="pi pi-objects-column"
            fluid
            severity="info"
            class="flex-1"
            @click="generateItems"
          />
          <Button label="Download All" class="flex-1" icon="pi pi-download" fluid severity="help" @click="downloadAll" />
          <Button v-if="recordId && isOwner" label="Update Link" icon="pi pi-refresh" fluid severity="success" class="flex-1" @click="updateLink" />

          <Button v-else label="Generate Link" icon="pi pi-link" fluid severity="success" class="flex-1" @click="generateLink" />
        </div>
      </div>
    </div>

    <!-- Generated Items -->
    <div v-if="items.length !== 0" class="gap-6" :class="settingsStore.columnClass">
      <div v-for="content, index in items" :key="content.id">
        <div class="mb-6 break-inside-avoid-column">
          <CardToolsContent :content="content" @download-file="downloadFile" />
          <!-- TODO: fix layout for uneven item to column ratio -->
          <!-- <div v-if="items.length % 4 === 0 && index === items.length - 1">
            <div
              class="bg-dark-red p-4 rounded-lg shadow-md h-[350px]"
            />
          </div> -->
        </div>
      </div>
    </div>

    <div v-if="isBaseSettingsDialogVisible">
      <DialogBaseSettings
        :is-visible="isBaseSettingsDialogVisible"
        @update:is-visible="isBaseSettingsDialogVisible = $event" @settings-apply="onFiltersSettingsApply"
      />
    </div>
  </div>
</template>

<style scoped>
</style>
