export interface Root {
    data: Data
}

export interface Data {
    mangaChapters: MangaChapters
}

export interface MangaChapters {
    edges: Edge[]
    pageInfo: PageInfo
    totalCount: number
    __typename: string
}

export interface Edge {
    node: Node
    // __typename: string
}

export interface Node {
    id: string
    // slug: string
    name: any
    number: string
    pages: Page[]
    volume: string
    // createdAt: string
    // creator: Creator
    // __typename: string
}

export interface Page {
    image: Image
    number: number
    // __typename: string
}

export interface Image {
    original: Original
}

export interface Original {
    url: string
}

export interface Creator {
    id: string
    slug: string
    name: string
    verified: boolean
    bot: boolean
    level: number
    avatar: Avatar
    frame: any
    status: any
    __typename: string
}

export interface Avatar {
    id: string
    animation: boolean
    blurhash: string
    original: Original
    __typename: string
}

export interface Original {
    url: string
    __typename: string
}

export interface PageInfo {
    hasNextPage: boolean
    endCursor: string
}
