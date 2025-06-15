<script setup lang="ts">
// @/views/CollectionsView.ts
import type { PageState } from 'primevue/paginator'
import { useFetchItems } from '@/composables/useFetchItems'
import { storeAuth } from '@/stores/storeAuth'
import { storeFilters } from '@/stores/storeFilters'
import { storeSettings } from '@/stores/storeSettings'
import { useToast } from 'primevue/usetoast'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// Setup
const toast = useToast()
const router = useRouter()
const route = useRoute()

const filtersStore = storeFilters()
const settingsStore = storeSettings()
const authStore = storeAuth()

const {
  items,
  itemsTotal,
  itemsCurrentPage,
  isLoading,
  fetchItems,
} = useFetchItems(route.meta.customEndpoint, route, settingsStore, authStore)

// Modals
const isBaseFiltersDialogVisible = ref(false)
function filtersOpen() {
  isBaseFiltersDialogVisible.value = true
}
const isBaseSettingsDialogVisible = ref(false)
function optionsOpen() {
  isBaseSettingsDialogVisible.value = true
}

// Functions
async function changePage(e: PageState) {
  await fetchItems(e.page + 1)
  isLoading.value = false
  window.scrollTo(0, 0)
}

async function onFiltersSettingsApply() {
  router.replace({ query: Object.fromEntries(new URLSearchParams(filtersStore.queryParams)) })
  await fetchItems(1)
  toast.add({ severity: 'success', summary: 'Success!', detail: 'Filters have been applied.', life: 1000 })
  isLoading.value = false
}

onMounted(async () => {
  await filtersStore.refetchFiltersData()
  await settingsStore.settingsLoad()
  filtersStore.applyQueryFilters(route.query)
  filtersStore.filtersSave()

  await fetchItems(1)
  isLoading.value = false
})
</script>

<template>
  <div>
    <Filterbar
      @search="onFiltersSettingsApply" @filters-open="filtersOpen" @options-open="optionsOpen"
      @filters-apply="onFiltersSettingsApply"
    />

    <NavigationSaved v-if="route.meta.personalizedView" />
    <NavigationBase v-else />

    <div v-if="isLoading === true">
      <div class="flex justify-center items-center mt-16">
        <ProgressSpinner />
      </div>
    </div>
    <div v-else-if="items.length !== 0">
      <div class="gap-8" :class="settingsStore.columnClass">
        <div v-for="content in items" :key="content.id">
          <div v-if="content.title" class="mb-6 break-inside-avoid-column">
            <CardStackedContent :content="content" :is-set="route.meta.isSet" @filter-apply="onFiltersSettingsApply" />
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      <div class="flex justify-center items-center mt-16">
        <h1 class="text-2xl">
          No results.
        </h1>
      </div>
    </div>

    <div class="fixed p-4 mx-auto bottom-0 left-0 right-0 shadow-2xl z-50 max-w-xl">
      <div class="card mx-auto">
        <Paginator
          v-model:first="itemsCurrentPage" :template="{
            default: 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink JumpToPageInput',
          }" :rows="+settingsStore.settings.contentCount" :total-records="itemsTotal" @page="changePage"
        />
      </div>
    </div>

    <div v-if="isBaseFiltersDialogVisible">
      <DialogBaseFilters
        :is-visible="isBaseFiltersDialogVisible"
        @update:is-visible="isBaseFiltersDialogVisible = $event" @filters-apply="onFiltersSettingsApply"
      />
    </div>
    <div v-if="isBaseSettingsDialogVisible">
      <DialogBaseSettings
        :is-visible="isBaseSettingsDialogVisible"
        @update:is-visible="isBaseSettingsDialogVisible = $event" @settings-apply="onFiltersSettingsApply"
      />
    </div>
  </div>
</template>
