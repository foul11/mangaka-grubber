export interface Root {
    count: number
    next: any
    previous: any
    results: Result[]
}

export interface Result {
    stats: Stats
    settings?: Settings
    is_access: boolean
    is_show_porno: boolean
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

export interface Stats {
    views: number
    likes: number
}

export interface Settings {
    date_open?: string
    uid: string
    is_free: boolean
    price: string
}
