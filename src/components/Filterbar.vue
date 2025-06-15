<script setup lang="ts">
import { useWindowSize } from '@/composables/useWindowSize'
import { storeFilters } from '@/stores/storeFilters'
// @/components/Filterbar.vue
import { ref } from 'vue'

const emit = defineEmits([
  'filtersOpen',
  'optionsOpen',
  'filtersApply',
])

const filtersStore = storeFilters()

const {
  isMobile,
} = useWindowSize()

const searchValue = ref('')

function filtersReset() {
  localStorage.removeItem('filters')
  localStorage.removeItem('searchValue')
  filtersStore.queryParams = ''
  filtersStore.filtersReset()

  searchValue.value = ''
  emit('filtersApply')
}

function filtersApply() {
  if (searchValue.value.length > 0) {
    localStorage.setItem('searchValue', searchValue.value)
  }
  else {
    localStorage.removeItem('searchValue')
  }
  filtersStore.filtersSave()
  emit('filtersApply')
}

function optionsOpen() {
  emit('optionsOpen')
}

function filtersOpen() {
  emit('filtersOpen')
}
</script>

<template>
  <div class="mx-auto my-4 flex">
    <span class="relative flex-1">
      <i class="pi pi-search absolute top-2/4 -mt-2 left-3 text-surface-400 dark:text-surface-600" />
      <InputText v-model="searchValue" placeholder="Search by title..." class="!pl-10 w-full" @keyup.enter="filtersApply" />
    </span>
    <Button :label="isMobile ? '' : 'Clear'" icon="pi pi-filter-slash" :disabled="!filtersStore.isFilterSet" outlined class="ml-2" :severity="!filtersStore.isFilterSet ? 'secondary' : 'danger'" @click="filtersReset" />
    <Button v-if="!isMobile" icon="pi pi-cog" severity="secondary" class="ml-2" @click="optionsOpen" />
    <Button icon="pi pi-filter" aria-label="Filters" class="ml-2" :severity="filtersStore.isFilterSet ? 'info' : 'secondary'" @click="filtersOpen" />
    <Button label="Search" class="ml-2 w-36" severity="success" @click="filtersApply" />
  </div>
</template>

<style>
.red-dot {
  position: absolute;
  bottom: 0;
  right: 0;
  transform: translate(50%, 50%);
  width: 8px;  /* Small dot size */
  height: 8px;
  background-color: red;
  border-radius: 50%;
  border: 2px solid white;  /* Optional, adds a white border around the dot for better visibility on different backgrounds */
}
</style>
