import type * as Common from '@/interfaces/typesCommon'
// @/components/typesContents.ts

export interface ContentsExpand {
  group: Common.Group[]
  idol: Common.Idol[]
  tag: Common.Tag[]
  uploader: Common.Uploader[] // Assume there is always exactly one uploader per item
  likes: Common.Like[]
}

export interface ContentsItem extends Common.Item {
  expand: ContentsExpand
  date: string
  discord: string
  file: string
  kpfhdFile: string
  filetype: string
  mirror: string
  set: string
  source: string
  title: string
  tag: string[] // relation
  group: string[] // relation
  idol: string[] // relation
  uploader: string[] // relation
}

export interface ContentsResponse extends Common.Base {
  items: ContentsItem[]
}
