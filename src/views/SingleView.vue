<script setup lang="ts">
// @/views/SingleView.ts
import { useFetchItem } from '@/composables/useFetchItem'
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const item_id = route.params.id
const {
  item,
  fetchItem,
} = useFetchItem(item_id)

onMounted(async () => {
  await fetchItem()
})
</script>

<template>
  <!-- <SingleMetadata :content="item" /> -->

  <NavigationBase class="my-4" />

  <div class="flex justify-center">
    <div v-if="item">
      <div>
        <CardSingleContent :content="item" />
      </div>
    </div>
    <div v-else>
      <div class="flex justify-center items-center min-h-screen">
        <ProgressSpinner />
      </div>
    </div>
  </div>
</template>
