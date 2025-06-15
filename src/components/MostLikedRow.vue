<script setup lang="ts">
import { useWindowSize } from '@/composables/useWindowSize'
import { MostLikedModes } from '@/interfaces/typesFilters'
import { storeFilters } from '@/stores/storeFilters'

const emit = defineEmits([
  'filtersApply',
])
const filtersStore = storeFilters()
const { isMobile } = useWindowSize()

const buttons = [
  { label: 'All Time', shortLabel: 'All', mode: MostLikedModes.AllTime },
  { label: '1 Year', shortLabel: '1y', mode: MostLikedModes.OneYear },
  { label: '6 Months', shortLabel: '6m', mode: MostLikedModes.SixMonths },
  { label: '3 Months', shortLabel: '3m', mode: MostLikedModes.ThreeMonths },
  { label: '1 Month', shortLabel: '1m', mode: MostLikedModes.OneMonth },
  { label: '1 Week', shortLabel: '1w', mode: MostLikedModes.OneWeek },
]

function filtersApply(mode: MostLikedModes) {
  filtersStore.setMostLikedMode(mode)
  emit('filtersApply')
}
</script>

<template>
  <div class="flex items-start">
    <Button
      icon="pi pi-heart"
      class="flex-1 mr-2"
      severity="secondary"
      variant="outlined"
      disabled
      :label="isMobile ? 'Top:' : 'Top:'"
    />
    <div class="flex gap-2 mb-4 flex-8">
      <Button
        v-for="button in buttons"
        :key="button.mode"
        class="flex-1"
        :class="filtersStore.mostLikedMode === button.mode ? 'active' : 'inactive'"
        :label="isMobile ? button.shortLabel : button.label"
        @click="filtersApply(button.mode)"
      />
    </div>
  </div>
</template>

<style scoped>
.inactive {
  background-color: var(--p-sky-100) !important;
  border-color: var(--p-sky-100) !important;
}

.active {
  background-color: var(--p-sky-300) !important;
  border-color: var(--p-sky-300) !important;
}
</style>
