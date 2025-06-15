<script setup lang="ts">
import type { Settings } from '@/interfaces/typesSettings'
import { storeSettings } from '@/stores/storeSettings'
import { onMounted, ref } from 'vue'

defineProps({
  isVisible: Boolean,
})

const emit = defineEmits([
  'settingsApply',
  'update:isVisible',
])

const settingsStore = storeSettings()
const settings = ref<Settings>({
  columnCount: '3',
  contentCount: '12',
  dataSavingMode: 'Disabled',
})

onMounted(() => {
  settingsStore.settingsLoad()
  settings.value = JSON.parse(JSON.stringify(settingsStore.settings))
})

function optionsReset() {
  settingsStore.settingsReset()
}

function optionsApply() {
  settingsStore.settings = settings.value
  settingsStore.settingsSave()
  emit('settingsApply')
  handleHide()
}

function handleVisibilityChange(value: boolean) {
  emit('update:isVisible', value)
}

function handleHide() {
  emit('update:isVisible', false)
  settingsStore.settingsSave()
}
</script>

<template>
  <Dialog
    dismissable-mask
    :visible="isVisible"
    modal
    header="Settings"
    :style="{ width: '50vw' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }" @hide="handleHide" @update:visible="handleVisibilityChange"
  >
    <div>
      <div class="mb-4">
        <h3>Max Column Count</h3>
        <SelectButton id="p-custom-contenttype" v-model="settings.columnCount" :options="settingsStore.columnCountOptions" aria-labelledby="basic" :allow-empty="false" />
      </div>

      <div class="mb-4">
        <h3>Max Content Count</h3>
        <SelectButton id="p-custom-contenttype" v-model="settings.contentCount" :options="settingsStore.contentCountOptions" aria-labelledby="basic" :allow-empty="false" />
      </div>

      <div class="mb-4">
        <h3>Data Saving Mode</h3>
        <SelectButton id="p-custom-contenttype" v-model="settings.dataSavingMode" :options="settingsStore.dataSavingModeOptions" aria-labelledby="basic" :allow-empty="false" />
      </div>

      <div class="mb-4">
        <h3>No Distractions Mode</h3>
        <SelectButton id="p-custom-contenttype" v-model="settings.noDistractionMode" :options="settingsStore.noDistractionModeOptions" aria-labelledby="basic" :allow-empty="false" />
      </div>

      <div class="flex gap-4 mt-8">
        <Button severity="danger" label="Reset" fluid variant="outlined" @click="optionsReset" />
        <Button severity="success" label="Save & Apply" fluid @click="optionsApply" />
      </div>
    </div>
  </Dialog>
</template>

<style scoped>
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
