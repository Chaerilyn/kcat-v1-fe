<script setup lang="ts">
// @/views/ContentsView.ts
import type { PageState } from 'primevue/paginator'
import { useFetchItems } from '@/composables/useFetchItems'
import { useWindowSize } from '@/composables/useWindowSize'
import { MostLikedModes } from '@/interfaces/typesFilters'
import { storeAuth } from '@/stores/storeAuth'
import { storeFilters } from '@/stores/storeFilters'
import { storeSettings } from '@/stores/storeSettings'
import { useToast } from 'primevue/usetoast'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// Setup
const toast = useToast()
const router = useRouter()
const route = useRoute()

const filtersStore = storeFilters()
const settingsStore = storeSettings()
const authStore = storeAuth()

const {
  isMobile,
} = useWindowSize()

const {
  items,
  itemsTotal,
  itemsCurrentPage,
  isLoading,
  fetchItems,
} = useFetchItems(route.meta.customEndpoint, route, settingsStore, authStore)

const firstItemIndex = computed(() => (itemsCurrentPage.value - 1) * Number(settingsStore.settings.contentCount))

// Reactive property to store the title
const pageTitle = ref<string | null>(null)

// Modals
const isBaseFiltersDialogVisible = ref(false)
function filtersOpen() {
  isBaseFiltersDialogVisible.value = true
}
const isBaseSettingsDialogVisible = ref(false)
function optionsOpen() {
  isBaseSettingsDialogVisible.value = true
}
const isMostLikedRowVisible = ref(false)
async function likedRowToggle() {
  if (filtersStore.mostLikedMode) {
    filtersStore.filtersReset()
  }
  else {
    filtersStore.setMostLikedMode(MostLikedModes.AllTime)
  }
  isMostLikedRowVisible.value = !isMostLikedRowVisible.value
  await onFiltersSettingsApply()
}

// Functions
async function changePage(e: PageState) {
  const newPage = e.page + 1
  router.replace({
    query: {
      ...route.query,
      page: newPage.toString(),
    },
  })

  await fetchItems(newPage)
  isLoading.value = false
  window.scrollTo(0, 0)
}

async function onFiltersSettingsApply() {
  router.replace({ query: Object.fromEntries(new URLSearchParams(filtersStore.queryParams)) })
  itemsCurrentPage.value = 1
  await fetchItems(itemsCurrentPage.value)
  toast.add({ severity: 'success', summary: 'Success!', detail: 'Filters have been applied.', life: 1000 })
  isLoading.value = false
}

// Lifecycle
onMounted(async () => {
  await filtersStore.refetchFiltersData()
  await settingsStore.settingsLoad()
  filtersStore.applyQueryFilters(route.query)
  filtersStore.filtersSave()

  // Retrieve the title from localStorage
  pageTitle.value = localStorage.getItem('pageTitle')

  // Optional: Clear the title from localStorage after retrieving
  localStorage.removeItem('pageTitle')

  const initialPage = Number.parseInt(route.query.page as string) || 1
  itemsCurrentPage.value = initialPage
  await fetchItems(initialPage)
  isLoading.value = false
})

watch(
  () => route.query,
  async (newQuery, oldQuery) => {
    if (!newQuery.page && oldQuery.page) {
      itemsCurrentPage.value = 1
      await fetchItems(1)
      isLoading.value = false
    }
  },
  { deep: true },
)
</script>

<template>
  <div>
    <Filterbar @search="onFiltersSettingsApply" @filters-open="filtersOpen" @options-open="optionsOpen" @filters-apply="onFiltersSettingsApply" />

    <NavigationSaved v-if="route.meta.personalizedView" />

    <div v-else>
      <div class="flex justify-start items-start">
        <NavigationBase class="flex-1" />
        <Button :label="isMobile ? 'Top' : 'Top Posts'" :icon="filtersStore.mostLikedMode ? 'pi pi-angle-double-up' : 'pi pi-angle-double-down'" severity="info" class="ml-2" @click="likedRowToggle" />
      </div>
    </div>

    <div v-if="isMostLikedRowVisible">
      <MostLikedRow @filters-apply="onFiltersSettingsApply" />
    </div>

    <div v-if="pageTitle">
      <div class="flex justify-center items-center mb-2">
        <h1 class="text-2xl text-rose-400	">
          {{ pageTitle }}
        </h1>
      </div>
    </div>

    <div v-if="isLoading === true">
      <div class="flex justify-center items-center mt-16">
        <ProgressSpinner />
      </div>
    </div>
    <div v-else-if="items.length !== 0">
      <div class="gap-6" :class="settingsStore.columnClass">
        <div v-for="content in items" :key="content.id">
          <div v-if="content.file || content.kpfhdFile" class="mb-6 break-inside-avoid-column">
            <CardBaseContent :content="content" @filters-apply="onFiltersSettingsApply" />
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

    <div class="fixed p-4 mx-auto bottom-0 left-0 right-0 z-50 max-w-xl">
      <Paginator
        :first="firstItemIndex"
        :template="{
          default: 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink JumpToPageInput',
        }"
        :rows="+settingsStore.settings.contentCount"
        :total-records="itemsTotal"
        @page="changePage"
      />
    </div>

    <div v-if="isBaseFiltersDialogVisible">
      <DialogBaseFilters :is-visible="isBaseFiltersDialogVisible" @update:is-visible="isBaseFiltersDialogVisible = $event" @filters-apply="onFiltersSettingsApply" />
    </div>
    <div v-if="isBaseSettingsDialogVisible">
      <DialogBaseSettings :is-visible="isBaseSettingsDialogVisible" @update:is-visible="isBaseSettingsDialogVisible = $event" @settings-apply="onFiltersSettingsApply" />
    </div>
  </div>
</template>

<style>
.p-paginator {
  background: #222a3d !important;
  opacity: 0.95;
  box-shadow: rgba(0, 0, 0, 0.8) 0px 3px 8px;
}
</style>
