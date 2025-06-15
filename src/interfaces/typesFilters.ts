import type * as Common from '@/interfaces/typesCommon'
// @/components/typesFilters.ts

export interface GroupResponse extends Common.Base {
  items: Common.Group[]
}

export interface IdolsResponse extends Common.Base {
  items: Common.Idol[]
}

export interface UploaderResponse extends Common.Base {
  items: Common.Uploader[]
}

export interface SavedFiltersResponse extends Common.Base {
  items: Common.SavedFilter[]
}

export interface TagsResponse extends Common.Base {
  items: Common.Tag[]
}

export interface Filters {
  idol: string[]
  group: string[]
  uploader: string[]
  filetype: string[]
  tag: string[]
  date: Date[]
  dateMode: string[]
  sort: string[]
}

export enum MostLikedModes {
  AllTime = 'alltime',
  OneYear = '1year',
  SixMonths = '6months',
  ThreeMonths = '3months',
  OneMonth = '1month',
  OneWeek = '1week',
}
