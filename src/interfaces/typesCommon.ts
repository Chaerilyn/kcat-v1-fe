export interface Item {
  collectionId: string
  collectionName: string
  created: string
  updated: string
  id: string
}

export interface Base {
  page: number
  perPage: number
  totalItems: number
  totalPages: number
}

export interface User extends Item {
  username: string
  email: string
  name: string
  avatar: string
}

export interface Idol extends Item {
  name: string
  code: string
  group: string // relation
}

export interface Group extends Item {
  name: string
  code: string
}

export interface Uploader extends Item {
  name: string
  account: string
  isFeatured: boolean
}

export interface Tag extends Item {
  name: string
  code: string
}

export interface Like extends Item {
  user: string // relation
  content: string // relation
}

export interface SavedFilter extends Item {
  name: string
  filters: string // relation
}
