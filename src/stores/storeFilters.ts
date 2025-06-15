// @/stores/storeFilters.ts
import type { Filters, Group, Idol, SavedFilter, Tags, Uploader } from '@/interfaces/FiltersResponse'
import type { LocationQuery } from 'vue-router'
import { MostLikedModes } from '@/interfaces/typesFilters'
import { defineStore } from 'pinia'
import PocketBase from 'pocketbase'
import { computed, ref } from 'vue'

const baseUrl = import.meta.env.VITE_BASE_URL
const pb = new PocketBase(baseUrl)

// Function to calculate date ranges based on mostLikedMode
function calculateDateRange(mode: MostLikedModes) {
  const endDate = new Date()
  const startDate = new Date()

  switch (mode) {
    case MostLikedModes.AllTime:
      startDate.setFullYear(2000, 0, 1)
      break
    case MostLikedModes.OneYear:
      startDate.setFullYear(endDate.getFullYear() - 1)
      break
    case MostLikedModes.SixMonths:
      startDate.setMonth(endDate.getMonth() - 6)
      break
    case MostLikedModes.ThreeMonths:
      startDate.setMonth(endDate.getMonth() - 3)
      break
    case MostLikedModes.OneMonth:
      startDate.setMonth(endDate.getMonth() - 1)
      break
    case MostLikedModes.OneWeek:
      startDate.setDate(endDate.getDate() - 7)
      break
  }

  // Reset times for consistency
  startDate.setHours(0, 0, 0, 0)
  endDate.setHours(23, 59, 59, 999)

  return { startDate, endDate }
}

export const storeFilters = defineStore('filtersStore', () => {
  // State
  const idols = ref<Idol[]>([])
  const groups = ref<Group[]>([])
  const tags = ref<Tags[]>([])
  const uploaders = ref<Uploader[]>([])
  const savedFilters = ref<SavedFilter[]>([])
  const sortType = ref([{ value: 'recent', option: 'Recent' }, { value: 'liked', option: 'Most Liked' }])

  const dateMode = ref([{ value: 'created', option: 'Created' }, { value: 'actual', option: 'Actual' }])

  const contentTypes = computed(() => [
    { option: 'Gifs', value: 'video' },
    { option: 'Pics', value: 'image' },
  ])

  const mostLikedMode = ref<MostLikedModes | null>(null)

  const isLoaded = ref(false)

  const filters = ref<Filters>({
    idol: [],
    group: [],
    tag: [],
    uploader: [],
    filetype: [],
    date: [],
    dateMode: dateMode.value[0],
    sort: sortType.value[0],
  })

  const queryParams = ref('')

  // Getters
  const isFilterSet = computed(() => {
    return Object.values(filters.value).some(array => array.length > 0)
  })

  // Setters
  function setMostLikedMode(mode: MostLikedModes) {
    mostLikedMode.value = mode
    const { startDate, endDate } = calculateDateRange(mode)

    // Update filters
    filters.value.date = [startDate, endDate]
    filters.value.sort = sortType.value[1]
    filtersSave()
  }

  // Actions
  async function fetchRecords<T>(collectionName: string): Promise<T[]> {
    try {
      const records = await pb.collection(collectionName).getFullList<T>({ sort: 'name' })
      return records
    }
    catch (error) {
      console.error(`Error fetching records from ${collectionName}:`, error)
      return []
    }
  }

  async function fetchFiltersData() {
    if (!isLoaded.value) {
      const [idolsData, groupsData, tagsData, uploadersData, savedFiltersData] = await Promise.all([
        fetchRecords<Idol>('groups_idols'),
        fetchRecords<Group>('groups'),
        fetchRecords<Group>('tags'),
        fetchRecords<Uploader>('uploaders'),
        fetchRecords<SavedFilter>('users_filters'),
      ])
      idols.value = idolsData
      groups.value = groupsData
      tags.value = tagsData
      uploaders.value = uploadersData
      savedFilters.value = savedFiltersData
      isLoaded.value = true
    }
  }

  async function refetchFiltersData() {
    if (!isLoaded.value) {
      await fetchFiltersData()
    }
  }

  async function fetchSavedFilters() {
    try {
      const savedFiltersData = await fetchRecords<SavedFilter>('users_filters')
      savedFilters.value = savedFiltersData
    }
    catch (error) {
      console.error('Error fetching saved filters:', error)
    }
  }

  function applyQueryFilters(query: LocationQuery) {
    if (query.idol) {
      const idolsQuery = Array.isArray(query.idol) ? query.idol : query.idol.split(',')
      filters.value.idol = idolsQuery.map(idolName =>
        idols.value.find(idol => idol.name === idolName) || null).filter(Boolean)
    }
    if (query.group) {
      const groupsQuery = Array.isArray(query.group) ? query.group : query.group.split(',')
      filters.value.group = groupsQuery.map(groupName =>
        groups.value.find(group => group.name === groupName) || null).filter(Boolean)
    }
    if (query.tag) {
      const tagsQuery = Array.isArray(query.tag) ? query.tag : query.tag.split(',')
      filters.value.tag = tagsQuery.map(tagName =>
        tags.value.find(tag => tag.name === tagName) || null).filter(Boolean)
    }
    if (query.uploader) {
      const uploadersQuery = Array.isArray(query.uploader) ? query.uploader : query.uploader.split(',')
      filters.value.uploader = uploadersQuery.map(uploaderName =>
        uploaders.value.find(uploader => uploader.name === uploaderName) || null).filter(Boolean)
    }
    if (query.filetype) {
      const filetypesQuery = Array.isArray(query.filetype) ? query.filetype : query.filetype.split(',')
      filters.value.filetype = filetypesQuery.map(type =>
        contentTypes.value.find(ct => ct.value === type) || null).filter(Boolean)
    }
    if (query.sort) {
      const sortQuery = sortType.value.find(sort => sort.value === query.sort)
      filters.value.sort = sortQuery || sortType.value[0]
    }
    // Parse the date range
    if (query.date) {
      const dateParts = Array.isArray(query.date) ? query.date[0].split(',') : query.date.split(',')
      const startDate = dateParts[0] ? new Date(dateParts[0]) : null
      const endDate = dateParts[1] ? new Date(dateParts[1]) : startDate // Use startDate if endDate is not provided

      // Assign to filters if valid dates
      filters.value.date = [startDate, endDate].filter(date => date instanceof Date && !Number.isNaN(date.getTime()))
    }
  }

  function filtersLoad() {
    const storedFilters = localStorage.getItem('filters')
    if (storedFilters) {
      const parsedFilters = JSON.parse(storedFilters)
      if (parsedFilters.date && parsedFilters.date.length) {
        parsedFilters.date = parsedFilters.date.map((dateString: string) => new Date(dateString))
      }
      filters.value = parsedFilters
    }
  }

  function filtersSave() {
    if (filters.value.date.length === 2 && filters.value.date[1] === null) {
      filters.value.date[1] = filters.value.date[0]
    }
    localStorage.setItem('filters', JSON.stringify(filters.value))

    const queryParts = []

    if (filters.value.idol && filters.value.idol.length)
      queryParts.push(`idol=${filters.value.idol.map(idol => encodeURIComponent(idol.name)).join(',')}`)
    if (filters.value.group && filters.value.group.length)
      queryParts.push(`group=${filters.value.group.map(group => encodeURIComponent(group.name)).join(',')}`)
    if (filters.value.tag && filters.value.tag.length)
      queryParts.push(`tag=${filters.value.tag.map(tag => encodeURIComponent(tag.name)).join(',')}`)
    if (filters.value.uploader && filters.value.uploader.length)
      queryParts.push(`uploader=${filters.value.uploader.map(uploader => encodeURIComponent(uploader.name)).join(',')}`)
    if (filters.value.filetype && filters.value.filetype.length)
      queryParts.push(`filetype=${filters.value.filetype.map(filetype => encodeURIComponent(filetype.value)).join(',')}`)
    if (filters.value.sort && filters.value.sort.value !== sortType.value[0].value)
      queryParts.push(`sort=${filters.value.sort.value}`)

    // Add date range to query
    if (filters.value.date && filters.value.date.length > 0) {
      const startDate = filters.value.date[0]?.toISOString().split('T')[0] // Convert to YYYY-MM-DD
      const endDate = filters.value.date[1]?.toISOString().split('T')[0]
      if (startDate) {
        if (endDate && startDate !== endDate) {
          queryParts.push(`date=${encodeURIComponent(startDate)},${encodeURIComponent(endDate)}`)
        }
        else {
          queryParts.push(`date=${encodeURIComponent(startDate)}`)
        }
      }
    }

    queryParams.value = queryParts.join('&')
  }

  function filtersReset() {
    filters.value = {
      idol: [],
      group: [],
      tag: [],
      uploader: [],
      filetype: [],
      date: [],
      dateMode: dateMode.value[0],
      sort: sortType.value[0],
    }

    mostLikedMode.value = null
    localStorage.removeItem('searchValue')
    filtersSave()
  }

  return {
    idols,
    groups,
    tags,
    uploaders,
    mostLikedMode,
    sortType,
    savedFilters,
    isLoaded,
    filters,
    queryParams,
    isFilterSet,
    contentTypes,
    dateMode,
    fetchFiltersData,
    refetchFiltersData,
    fetchSavedFilters,
    applyQueryFilters,
    filtersLoad,
    filtersSave,
    filtersReset,
    setMostLikedMode,
  }
})
