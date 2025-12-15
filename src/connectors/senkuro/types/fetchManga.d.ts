export interface Root {
    data: Data
}

export interface Data {
    manga: Manga
}

export interface Manga {
    id: string
    // malId: number
    // muId: string
    // slug: string
    // originalName: OriginalName
    titles: Title[]
    // alternativeNames: AlternativeName[]
    // localizations: Localization[]
    // type: string
    // status: string
    // formats: string[]
    // source: any
    // translitionStatus: string
    // views: number
    // score: number
    // totalChaptersViews: number
    // originCountry: string
    // releasedOn: string
    // completedOn: any
    // rating: string
    // chapters: number
    // isLicensed: boolean
    // containExplicitThemes: boolean
    // commentsEnabled: boolean
    // links: Link[]
    // labels: Label[]
    // series: any[]
    // publishers: Publisher[]
    branches: Branch[]
    // mainCharacters: any[]
    // mainStaff: MainStaff[]
    // cover: Cover
    // banner: any
    // userBookmarkStatusDistributions: UserBookmarkStatusDistribution[]
    // scoreDistributions: ScoreDistribution[]
    // relations: any[]
    // recommendations: Recommendation[]
    // pinnedComment: PinnedComment
    // viewerVote: any
    // viewerBookmark: any
    // viewerBookmarkFriends: any[]
    // viewerInBlockedCountry: boolean
    // __typename: string
}

export interface OriginalName {
    lang: string
    content: string
    __typename: string
}

export interface Title {
    lang: string
    content: string
    __typename: string
}

export interface AlternativeName {
    lang: string
    content: string
    __typename: string
}

export interface Localization {
    lang: string
    description?: Description[]
    __typename: string
}

export interface Description {
    __typename: string
    type: string
    content: Content[]
}

export interface Content {
    type: string
    text: string
    marks: any[]
    __typename: string
}

export interface Link {
    url: string
    type: string
    service: string
    __typename: string
}

export interface Label {
    id: string
    slug: string
    titles: Title2[]
    gender: any
    __typename: string
}

export interface Title2 {
    lang: string
    content: string
    __typename: string
}

export interface Publisher {
    id: string
    slug: string
    name: string
    titles: Title3[]
    logotype: any
    __typename: string
}

export interface Title3 {
    lang: string
    content: string
    __typename: string
}

export interface Branch {
    id: string
    lang: string
    chapters: number
    // translitionStatus: string
    // manageRestriction: string
    primaryBranch: boolean
    // completed: boolean
    // primaryTeamActivities: PrimaryTeamActivity[]
    // __typename: string
    // teamActivities: TeamActivity[]
    // viewerCanTranslate: boolean
    // viewerCanManage: boolean
    // viewerCanUpload: boolean
}

export interface PrimaryTeamActivity {
    ranges: Range[]
    team: Team
    __typename: string
}

export interface Range {
    start: string
    end: string
    __typename: string
}

export interface Team {
    id: string
    slug: string
    name: string
    activity: string
    verified: boolean
    avatar: Avatar
    __typename: string
}

export interface Avatar {
    id: string
    blurhash: string
    original: Original
    __typename: string
}

export interface Original {
    url: string
    __typename: string
}

export interface TeamActivity {
    ranges: Range2[]
    team: Team2
    __typename: string
}

export interface Range2 {
    start: string
    end: string
    __typename: string
}

export interface Team2 {
    id: string
    slug: string
    name: string
    activity: string
    verified: boolean
    avatar: Avatar2
    __typename: string
}

export interface Avatar2 {
    id: string
    blurhash: string
    original: Original2
    __typename: string
}

export interface Original2 {
    url: string
    __typename: string
}

export interface MainStaff {
    id: string
    roles: string[]
    person: Person
    __typename: string
}

export interface Person {
    id: string
    slug: string
    name: string
    titles: Title4[]
    cover: any
    __typename: string
}

export interface Title4 {
    lang: string
    content: string
    __typename: string
}

export interface Cover {
    id: string
    blurhash: string
    original: Original3
    preview: Preview
    __typename: string
    main: Main
}

export interface Original3 {
    height: number
    width: number
    url: string
    __typename: string
}

export interface Preview {
    url: string
    __typename: string
}

export interface Main {
    url: string
    __typename: string
}

export interface UserBookmarkStatusDistribution {
    count: number
    status: string
    __typename: string
}

export interface ScoreDistribution {
    count: number
    score: number
    __typename: string
}

export interface Recommendation {
    id: string
    slug: string
    originalName: OriginalName2
    titles: Title5[]
    status: string
    type: string
    formats: string[]
    rating: string
    score: number
    containExplicitThemes: boolean
    cover: Cover2
    viewerBookmark: any
    __typename: string
}

export interface OriginalName2 {
    lang: string
    content: string
    __typename: string
}

export interface Title5 {
    lang: string
    content: string
    __typename: string
}

export interface Cover2 {
    id: string
    blurhash: string
    original: Original4
    preview: Preview2
    __typename: string
}

export interface Original4 {
    height: number
    width: number
    url: string
    __typename: string
}

export interface Preview2 {
    url: string
    __typename: string
}

export interface PinnedComment {
    id: string
    threadId: string
    parentId: any
    depth: number
    content: Content2[]
    upvotes: number
    downvotes: number
    repliesCount: number
    createdAt: string
    updatedAt: string
    deletedAt: any
    viewerDidAuthor: boolean
    viewerCanUpdate: boolean
    viewerCanDelete: boolean
    viewerVoteDirection: any
    author: Author
    __typename: string
}

export interface Content2 {
    __typename: string
    type: string
    content?: Content3[]
}

export interface Content3 {
    type: string
    text?: string
    marks?: Mark[]
    __typename: string
    attrs?: Attrs
}

export interface Mark {
    type: string
    __typename: string
}

export interface Attrs {
    id: string
    unicode: string
    url: string
    __typename: string
}

export interface Author {
    id: string
    slug: string
    name: string
    verified: boolean
    bot: boolean
    level: number
    avatar: Avatar3
    frame: Frame
    status: Status
    __typename: string
    banned: boolean
}

export interface Avatar3 {
    id: string
    animation: boolean
    blurhash: string
    original: Original5
    __typename: string
}

export interface Original5 {
    url: string
    __typename: string
}

export interface Frame {
    id: string
    animation: boolean
    blurhash: string
    original: Original6
    __typename: string
}

export interface Original6 {
    url: string
    __typename: string
}

export interface Status {
    id: string
    animation: boolean
    blurhash: string
    caption: any
    original: Original7
    __typename: string
}

export interface Original7 {
    url: string
    __typename: string
}
