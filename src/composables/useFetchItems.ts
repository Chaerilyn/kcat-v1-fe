// @/composables/useFetchItems.ts
import type { Filters } from '@/interfaces/FiltersResponse'
import type { CollectionsItem, CollectionsResponse } from '@/interfaces/typesCollections'
import type { ContentsItem, ContentsResponse } from '@/interfaces/typesContents'
import type { SetsItem, SetsResponse } from '@/interfaces/typesSets'
import type { Ref } from 'vue'
import PocketBase from 'pocketbase'
import { ref } from 'vue'

const baseUrl = import.meta.env.VITE_BASE_URL
const pb = new PocketBase(baseUrl)

function buildFilterQuery(useContentPrefix = false) {
  const queries = []
  let filters: Filters = {}
  let sortValue = '-created'
  const storedFilters = localStorage.getItem('filters')
  const searchValue = localStorage.getItem('searchValue')
  const mostLikedMode = localStorage.getItem('mostLikedMode')
  const prefix = useContentPrefix ? 'content.' : ''

  if (storedFilters) {
    try {
      filters = JSON.parse(storedFilters)
    }
    catch (error) {
      console.error('Error parsing filters from localStorage:', error)
      return ''
    }
  }

  if (mostLikedMode?.length > 0) {
    try {
      let startDate
      const endDate = new Date() // Set the end date once

      switch (mostLikedMode) {
        case 'alltime': {
          startDate = new Date('2000-01-01T00:00:00')
          break
        }
        case '1year': {
          startDate = new Date()
          startDate.setFullYear(endDate.getFullYear() - 1)
          break
        }
        case '6months': {
          startDate = new Date()
          startDate.setMonth(endDate.getMonth() - 6)
          break
        }
        case '3months': {
          startDate = new Date()
          startDate.setMonth(endDate.getMonth() - 3)
          break
        }
        case '1month': {
          startDate = new Date()
          startDate.setMonth(endDate.getMonth() - 1)
          break
        }
        case '1week': {
          startDate = new Date()
          startDate.setDate(endDate.getDate() - 7)
          break
        }
        default: {
          throw new Error('Invalid option for mostLiked')
        }
      }

      startDate.setHours(0, 0, 0, 0)
      endDate.setHours(23, 59, 59, 999)
      const startDateStr = `${startDate.getFullYear()}-${(startDate.getMonth() + 1).toString().padStart(2, '0')}-${startDate.getDate().toString().padStart(2, '0')} 00:00:00`
      const endDateStr = `${endDate.getFullYear()}-${(endDate.getMonth() + 1).toString().padStart(2, '0')}-${endDate.getDate().toString().padStart(2, '0')} 23:59:59`
      const query = `${prefix}created>='${startDateStr}'&&${prefix}created<='${endDateStr}'`
      queries.push(query)
    }
    catch (error) {
      console.error('Error handling date filters:', error)
    }
  }
  else if (filters.date && filters.date.length === 2) {
    try {
      const startDate = new Date(filters.date[0])
      const endDate = new Date(filters.date[1])
      endDate.setHours(23, 59, 59, 999)
      const startDateStr = `${startDate.getFullYear()}-${(startDate.getMonth() + 1).toString().padStart(2, '0')}-${startDate.getDate().toString().padStart(2, '0')} 00:00:00`
      const endDateStr = `${endDate.getFullYear()}-${(endDate.getMonth() + 1).toString().padStart(2, '0')}-${endDate.getDate().toString().padStart(2, '0')} 23:59:59`
      const query = `${prefix}created>='${startDateStr}'&&${prefix}created<='${endDateStr}'`
      queries.push(query)
    }
    catch (error) {
      console.error('Error handling date filters:', error)
    }
  }

  if (searchValue?.length > 0) {
    queries.push(`${prefix}title~"${searchValue}"`)
  }

  Object.entries(filters).forEach(([key, value]) => {
    if (value && Array.isArray(value) && value.length > 0) {
      const filterQuery = value.map((item) => {
        if (item.name) {
          return `${prefix}${key}.name?="${item.name}"`
        }
        else if (item.code) {
          return `${prefix}${key}.code?="${item.code}"`
        }
        else if (item.option) {
          return `${prefix}${key}?="${item.value}"`
        }
        return null
      }).filter(item => item !== null).join('||')

      if (filterQuery) {
        queries.push(`(${filterQuery})`)
      }
    }
  })

  if (filters.sort?.value === 'liked' || mostLikedMode?.length > 0) {
    sortValue = '-likes:length'
  }

  return [queries.join('&&'), sortValue]
}

export function useFetchItems(fetchVariation: string, route: any, settingsStore: any, authStore: any) {
  let items: Ref<ContentsItem[] | CollectionsItem[] | SetsItem[]>
  const itemsTotal = ref<number>(0)
  const itemsCurrentPage = ref<number>(1)
  const isLoading = ref<boolean>(true)
  let fetchItems: (page: number) => Promise<void> = async () => {}

  if (fetchVariation === 'allContents') {
    items = ref<ContentsItem[]>([])

    fetchItems = async (page: number) => {
      isLoading.value = true
      const [query, sortValue] = buildFilterQuery(false)

      try {
        const records: ContentsResponse = await pb.collection('contents').getList(page, +settingsStore.settings.contentCount, {
          sort: sortValue,
          filter: query,
          expand: 'idol,group,tag,uploader,likes',
        })
        items.value = records.items
        itemsTotal.value = records.totalItems
      }
      catch (error) {
        console.error('Error fetching records:', error)
      }
    }
  }
  else if (fetchVariation === 'likedContents') {
    items = ref<ContentsItem[]>([])

    fetchItems = async (page: number) => {
      isLoading.value = true
      const [query, sortValue] = buildFilterQuery(false)

      try {
        const records: ContentsResponse = await pb.collection('contents').getList(page, +settingsStore.settings.contentCount, {
          sort: sortValue,
          filter: `${query}${query ? '&&' : ''}(likes.user?="${authStore.user.id}")`,
          expand: 'idol,group,tag,uploader,likes',
        })
        items.value = records.items
        itemsTotal.value = records.totalItems
      }
      catch (error) {
        console.error('Error fetching records:', error)
      }
    }
  }
  else if (fetchVariation === 'allSets') {
    items = ref<SetsItem[]>([])

    fetchItems = async (page: number) => {
      isLoading.value = true
      const [query, sortValue] = buildFilterQuery()

      try {
        const records: SetsResponse = await pb.collection('contents_sets').getList(page, +settingsStore.settings.contentCount, {
          sort: '-created',
          filter: query,
          expand: 'idol,group,tag,uploader,contents_via_set',
        })
        items.value = records.items
        itemsTotal.value = records.totalItems
      }
      catch (error) {
        console.error('Error fetching records:', error)
      }
    }
  }
  else if (fetchVariation === 'allCollections') {
    items = ref<CollectionsItem[]>([])

    fetchItems = async (page: number) => {
      isLoading.value = true
      const [query, sortValue] = buildFilterQuery()

      try {
        const records: CollectionsResponse = await pb.collection('contents_collections').getList(page, +settingsStore.settings.contentCount, {
          sort: '-created',
          filter: `${query}${query ? '&&' : ''}(isPublic=true)`,
          expand: 'user,contents_via_collections',
        })
        items.value = records.items
        itemsTotal.value = records.totalItems
      }
      catch (error) {
        console.error('Error fetching records:', error)
      }
    }
  }
  else if (fetchVariation === 'setContents') {
    items = ref<ContentsItem[]>([])

    fetchItems = async (page: number) => {
      isLoading.value = true
      const [query, sortValue] = buildFilterQuery(false)

      try {
        const records: ContentsResponse = await pb.collection('contents').getList(page, +settingsStore.settings.contentCount, {
          sort: sortValue,
          filter: `${query}${query ? '&&' : ''}(set="${route.params.id}")`,
          expand: 'idol,group,tag,uploader,likes',
        })
        items.value = records.items
        itemsTotal.value = records.totalItems
      }
      catch (error) {
        console.error('Error fetching records:', error)
      }
    }
  }
  else if (fetchVariation === 'collectionContents') {
    items = ref<ContentsItem[]>([])

    fetchItems = async (page: number) => {
      isLoading.value = true
      const [query, sortValue] = buildFilterQuery(false)

      try {
        const records: ContentsResponse = await pb.collection('contents').getList(page, +settingsStore.settings.contentCount, {
          sort: sortValue,
          filter: `${query}${query ? '&&' : ''}(collections~"${route.params.id}")`,
          expand: 'idol,group,uploader,likes',
        })
        items.value = records.items
        itemsTotal.value = records.totalItems
      }
      catch (error) {
        console.error('Error fetching records:', error)
      }
    }
  }
  else if (fetchVariation === 'savedCollections') {
    items = ref<CollectionsItem[]>([])

    fetchItems = async (page: number) => {
      isLoading.value = true
      const [query, sortValue] = buildFilterQuery()

      try {
        const records: CollectionsResponse = await pb.collection('contents_collections').getList(page, +settingsStore.settings.contentCount, {
          sort: '-created',
          filter: `${query}${query ? '&&' : ''}(user?~'${pb.authStore.model?.id}')`,
          expand: 'user,contents_via_collections',
        })
        items.value = records.items
        itemsTotal.value = records.totalItems
      }
      catch (error) {
        console.error('Error fetching records:', error)
      }
    }
  }
  else if (fetchVariation === 'myContents') {
    items = ref<ContentsItem[]>([])

    fetchItems = async (page: number) => {
      isLoading.value = true
      const [query, sortValue] = buildFilterQuery(false)

      try {
        const records: ContentsResponse = await pb.collection('contents').getList(page, +settingsStore.settings.contentCount, {
          sort: '-created',
          filter: `${query}${query ? '&&' : ''}(uploader.id="${authStore.uploader.id}")`,
          expand: 'idol,group,tag,uploader,likes',
        })
        items.value = records.items
        itemsTotal.value = records.totalItems
      }
      catch (error) {
        console.error('Error fetching records:', error)
      }
    }
  }

  return {
    items,
    itemsTotal,
    itemsCurrentPage,
    isLoading,
    fetchItems,
  }
}
