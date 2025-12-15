export interface Root {
    publication: Publication
    content: Content[]
    pagination: Pagination
    settings: Settings
    stats: Stats
    team: Team
    is_access: boolean
    is_access_porno: boolean
    uid: string
    slug: string
    volume: string
    chapter: string
    name: string
    date_create: string
    date_change: string
    is_active: boolean
    views_day: number
    views_week: number
    views_total: number
    likes_total: number
}

export interface Publication {
    uid: string
    name: string
    image: string
    type: string
    categories_manga: CategoriesManga
    is_porno: boolean
    slug: string
}

export interface CategoriesManga {
    name: string
    slug: string
}

export interface Content {
    uid: string
    number: number
    image: string
}

export interface Pagination {
    prev_chapter: string
    next_chapter: any
}

export interface Settings {
    date_open: string
    uid: string
    is_free: boolean
    price: string
}

export interface Stats {
    views: number
    likes: number
}

export interface Team {
    uid: string
    name: string
    photo: string
    default_color_image: string
    vk_group: VkGroup
    slug: string
}

export interface VkGroup {
    uid: string
    group_id: string
    name: string
    url_site: string
}
