// src/composables/useRecords.js
import type { CollectionsItem } from '@/interfaces/typesCollections'
import type { ContentsItem } from '@/interfaces/typesContents'
import type { SetsItem } from '@/interfaces/typesSets'
import type { Ref } from 'vue'
import PocketBase from 'pocketbase'
import { ref } from 'vue'

const baseUrl = import.meta.env.VITE_BASE_URL
const pb = new PocketBase(baseUrl)

export function useFetchItem(item_id: string) {
  let item: Ref<ContentsItem | CollectionsItem | SetsItem>
  let fetchItem: () => Promise<void> = async () => {}
  const isLoading = ref<boolean>(true)

  item = ref<ContentsItem>()

  fetchItem = async () => {
    isLoading.value = true

    try {
      const record: ContentsItem = await pb.collection('contents').getOne(item_id, {
        sort: '-created',
        expand: 'idol,group,uploader,tag,set,collections,likes',
      })

      item.value = record
    }
    catch (error) {
      console.error('Error fetching records:', error)
    }
  }

  return {
    item,
    fetchItem,
    isLoading,
  }
}
