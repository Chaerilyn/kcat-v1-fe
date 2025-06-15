// @/stores/storeSettings.ts
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const storeSettings = defineStore('settingsStore', () => {
  // State
  const settings = ref({
    columnCount: '3',
    contentCount: '12',
    dataSavingMode: 'Disabled',
    noDistractionMode: 'Disabled',
  })

  // Getters
  const columnCountOptions = computed(() => ['1', '2', '3', '4'])

  const contentCountOptions = computed(() => ['12', '24', '48'])

  const dataSavingModeOptions = computed(() => ['Disabled', 'Enabled'])

  const noDistractionModeOptions = computed(() => ['Disabled', 'Enabled'])

  const columnClass = computed(() => {
    switch (settings.value.columnCount) {
      case '1': return 'columns-3xl max-w-128 m-auto'
      case '2': return 'columns-lg'
      case '3': return 'columns-sm'
      case '4': return 'columns-2xs'
      default: return 'columns-xs'
    }
  })

  // Actions
  function settingsLoad() {
    const loadedSettings = localStorage.getItem('settings')
    if (loadedSettings) {
      settings.value = JSON.parse(loadedSettings)
    }
  }

  function settingsSave() {
    localStorage.setItem('settings', JSON.stringify(settings.value))
  }

  function settingsReset() {
    settings.value.columnCount = '3'
    settings.value.contentCount = '12'
    settings.value.dataSavingMode = 'Disabled'
    settings.value.noDistractionMode = 'Disabled'
    settingsSave()
  }

  return {
    settings,
    columnCountOptions,
    contentCountOptions,
    dataSavingModeOptions,
    noDistractionModeOptions,
    columnClass,
    settingsLoad,
    settingsSave,
    settingsReset,
  }
})
