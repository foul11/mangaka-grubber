export interface Root {
    team: Team
    related_projects: any[]
    authors: any[]
    publishing_houses: any[]
    genres: Genre[]
    categories_manga: CategoriesManga
    tags: any[]
    store: any
    uid: string
    name: string
    name_en: string
    name_orig: string
    description: string
    type: string
    image: string
    date_create: string
    date_change: string
    date_publication: string
    age_limit: string
    publication_status: string
    slug: string
    views_day: number
    views_week: number
    views_total: number
    likes_total: number
    for_vk_users: boolean
    is_porno: boolean
}

export interface Team {
    vk_group: VkGroup
    uid: string
    slug: string
    name: string
    description: string
    photo: string
    default_color_image: string
    is_moderation: boolean
    is_show_shop: boolean
    is_open_team: boolean
    is_show_site: boolean
    is_show_members: boolean
    is_show_link_donut: boolean
    is_block_ban_comment_list: boolean
    date_created: string
}

export interface VkGroup {
    uid: string
    group_id: string
    name: string
    url_site: string
}

export interface Genre {
    name: string
    slug: string
}

export interface CategoriesManga {
    name: string
    slug: string
}
