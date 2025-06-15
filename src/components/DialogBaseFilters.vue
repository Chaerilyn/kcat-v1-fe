<script setup lang="ts">
import type { Filters } from '@/interfaces/typesFilters'
import { storeFilters } from '@/stores/storeFilters'
import PocketBase from 'pocketbase'
import { useToast } from 'primevue/usetoast'
import { onMounted, ref } from 'vue'

defineProps({
  isVisible: Boolean,
})

const emit = defineEmits([
  'filtersApply',
  'update:isVisible',
])

const pb = new PocketBase(import.meta.env.VITE_BASE_URL)
const toast = useToast()

const filtersStore = storeFilters()
const filters = ref<Filters>({
  idol: [],
  group: [],
  tag: [],
  uploader: [],
  filetype: [],
  date: [],
  dateMode: ref(filtersStore.dateMode[0]),
  sort: ref(filtersStore.sortType[0]),
})
const selectedSavedFilter = ref(null)
const isCreateSavedFilterVisible = ref(false)
const filterName = ref('')

onMounted(() => {
  filtersStore.filtersLoad()
  filters.value = JSON.parse(JSON.stringify(filtersStore.filters))
  for (const date in filters.value.date) {
    filters.value.date[date] = new Date(filters.value.date[date])
  }
})

function filtersApply() {
  filtersStore.filters = filters.value
  filtersStore.filtersSave()
  emit('filtersApply')
  handleHide()
}

function filtersReset() {
  filters.value = {
    idol: [],
    group: [],
    tag: [],
    uploader: [],
    filetype: [],
    date: [],
    dateMode: ref(filtersStore.dateMode[0]),
    sort: ref(filtersStore.sortType[0]),
  }

  selectedSavedFilter.value = null
}

function filtersChange() {
  if (selectedSavedFilter.value) {
    filters.value = JSON.parse(JSON.stringify(selectedSavedFilter.value.filters))
  }
  for (const date in filters.value.date) {
    filters.value.date[date] = new Date(filters.value.date[date])
  }
}

function handleVisibilityChange(value: boolean) {
  emit('update:isVisible', value)
}

function handleHide() {
  emit('update:isVisible', false)
}

async function savedFiltersSave() {
  try {
    const userId = pb.authStore.model?.id
    if (!userId) {
      throw new Error('User is not authenticated.')
    }
    const data = {
      user: userId,
      name: filterName.value,
      filters: JSON.stringify(filters.value),
    }
    await pb.collection('users_filters').create(data)
    isCreateSavedFilterVisible.value = false
    await filtersStore.fetchSavedFilters()
    toast.add({ severity: 'success', summary: 'Created!', detail: 'Filters saved to your filters.', life: 1000 })
  }
  catch (error) {
    console.error('Error saving filter:', error)
  }
}

async function deleteSavedFilter() {
  if (!selectedSavedFilter.value) {
    toast.add({ severity: 'warn', summary: 'Select a Filter', detail: 'Please select a filter to delete.', life: 3000 })
    return
  }
  try {
    await pb.collection('users_filters').delete(selectedSavedFilter.value.id)
    selectedSavedFilter.value = null
    await filtersStore.fetchSavedFilters() // Refresh the list of filters after deletion
    filtersReset()
    toast.add({ severity: 'success', summary: 'Deleted!', detail: 'Filter deleted successfully.', life: 3000 })
  }
  catch (error) {
    console.error('Error deleting filter:', error)
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete filter.', life: 3000 })
  }
}
</script>

<template>
  <Dialog
    dismissable-mask
    :visible="isVisible"
    modal
    header="Filters"
    :style="{ width: '50vw' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
    @hide="handleHide"
    @update:visible="handleVisibilityChange"
  >
    <div>
      <div class="mb-4">
        <h3>Saved Filters</h3>
        <div class="flex gap-2">
          <Select
            v-model="selectedSavedFilter" :options="filtersStore.savedFilters" option-label="name"
            placeholder="Browse saved filters..." filter class="flex-1" @change="filtersChange"
          />
          <Button severity="danger" :disabled="!selectedSavedFilter" label="Delete" class="w-36" @click="deleteSavedFilter" />
          <Button severity="help" label="New Filter" class="w-36" @click="isCreateSavedFilterVisible = true" />
        </div>
      </div>
      <div class="mb-4">
        <h3>Idols</h3>
        <MultiSelect
          v-model="filters.idol" display="chip" :options="filtersStore.idols" option-label="name"
          placeholder="Select idols..." fluid filter
        />
      </div>
      <div class="mb-4">
        <h3>Groups</h3>
        <MultiSelect
          v-model="filters.group" display="chip" :options="filtersStore.groups" option-label="name"
          placeholder="Search groups..." class="w-full" filter
        />
      </div>
      <div class="mb-4">
        <h3>Tags</h3>
        <MultiSelect
          v-model="filters.tag" display="chip" :options="filtersStore.tags" option-label="name"
          placeholder="Search tags..." class="w-full" filter
        />
      </div>
      <div class="mb-4">
        <h3>Uploaders</h3>
        <MultiSelect
          v-model="filters.uploader" display="chip" :options="filtersStore.uploaders" option-label="name"
          placeholder="Select uploaders..." fluid filter
        />
      </div>

      <div class="mb-4 flex gap-4">
        <div class="flex-1">
          <h3>Date Range</h3>
          <DatePicker v-model="filters.date" selection-mode="range" :manual-input="false" />
        </div>

        <div class="flex-1">
          <h3>Date Mode</h3>
          <SelectButton id="p-custom-contenttype" v-model="filters.dateMode" :options="filtersStore.dateMode" aria-labelledby="basic" option-label="option" />
        </div>
      </div>
      <div class="mb-4 flex gap-4">
        <div class="flex-1">
          <h3>Sort By</h3>
          <SelectButton id="p-custom-contenttype" v-model="filters.sort" :options="filtersStore.sortType" aria-labelledby="basic" option-label="option" />
        </div>

        <div class="flex-1">
          <h3>Content Type</h3>
          <SelectButton id="p-custom-contenttype" v-model="filters.filetype" :options="filtersStore.contentTypes" option-label="option" aria-labelledby="basic" multiple />
        </div>
      </div>

      <div class="flex gap-4 mt-8">
        <Button severity="danger" label="Reset" fluid variant="outlined" @click="filtersReset" />
        <Button severity="success" label="Save & Apply" fluid @click="filtersApply" />
      </div>
    </div>

    <Dialog v-model:visible="isCreateSavedFilterVisible" modal header="Save Filter" :style="{ width: '25rem' }">
      <div class="flex flex-col items-center gap-2">
        <label for="filtername" class="font-semibold text-center">Filter Name</label>
        <InputText id="filtername" v-model="filterName" class="flex-auto" autocomplete="off" />
      </div>
      <div class="flex gap-4 mt-8">
        <Button type="button" label="Cancel" severity="secondary" fluid @click="isCreateSavedFilterVisible = false" />
        <Button type="button" label="Save" severity="success" fluid @click="savedFiltersSave" />
      </div>
    </Dialog>
  </Dialog>
</template>

<style>
#p-custom-contenttype {
  display: flex;
}

#p-custom-contenttype > button {
  width: 100%;
}

.p-datepicker {
  width: 100%;
}
</style>
