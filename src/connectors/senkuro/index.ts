import { Connector } from '../../Connector';
import { fetchQL } from '../../utils/fetch';
import { Config } from '../../Config';

import type { Manga } from './types/fetchManga';
import type { MangaChapters, Node as MangaChapter } from './types/fetchMangaChapters';
import type { ConnectorMangaChapter, IConnectorAPI } from '../../Connector';

interface Branch {
    list: MangaChapters['edges']
    map: Map<string, MangaChapter>
}

export class Senkuro extends Connector implements IConnectorAPI {
    protected static API = 'https://api.senkuro.com/graphql';
    protected branches: Map<string, Branch> = new Map();
    protected manga: Manga | undefined;
    protected url: string;
    
    constructor(url: string) {
        super();
        
        this.url = url;
        
        if (/senkuro.com/.test(this.url)) {
            Senkuro.API = 'https://api.senkuro.com/graphql';
        } else if (/senkuro.me/.test(this.url)) {
            Senkuro.API = 'https://api.senkuro.me/graphql';
        }
    }
    
    parseSlugFromUrl() {
        return this.url.match(/\/manga\/([^\/]*)/)?.[1];
    }
    
    async fetchManga() {
        if (this.manga) {
            return this.manga;
        }
        
        const slug = this.parseSlugFromUrl();
        
        if (!slug) {
            throw new Error('Failed to extract slug from URL');
        }
        
        const data = await fetchQL(Senkuro.API, undefined, `
            query ($slug: String!) {
                manga(slug: $slug) {
                    id
                    
                    branches {
                        id
                        lang
                        chapters
                        primaryBranch
                    }
                        
                    titles {
                        content
                        lang
                    }
                }
            }
        `, {
            variables: {
                slug,
            },
        })
            .then(res => res.manga);
        
        console.log('Fetched manga by slug', slug);
        
        this.manga = data;
        return this.manga!;
    }
    
    async isNotOneBranch() {
        const manga = await this.fetchManga();
        return manga.branches.length > 1;
    }
    
    async getPrimaryBranch() {
        const manga = await this.fetchManga();
        return manga.branches.find(branch => branch.primaryBranch)?.id;
    }
    
    async fetchMangaChapters(branchId: string) {
        if (this.branches.has(branchId)) {
            return this.branches.get(branchId)!;
        }
        
        const gql = `
            query ($branchId: String!, $after: String, $orderBy: MangaChapterOrder!) {
                mangaChapters(
                    orderBy: $orderBy,
                    branchId: $branchId,
                    after: $after,
                    first: 10
                ) {
                    totalCount
                    
                    edges {
                        node {
                            id
                            name
                            number
                            volume
                            
                            pages {
                                number
                                
                                image {
                                    original {
                                        url
                                    }
                                }
                            }
                        }
                    }
                        
                    pageInfo {
                        endCursor
                        hasNextPage
                    }
                }
            }
        `;
        
        let chapters: MangaChapters['edges'] = [];
        const manga = await this.fetchManga();
        const short_name = await this.getShortName();
        const total = manga.branches.find(branch => branch.id === branchId)?.chapters ?? 0;
        
        const progressBar = this.progressBarSetup(`Получение глав [${short_name}]`, total);
        
        let next = true;
        let after = null;
        
        while (next) {
            await new Promise(resolve => setTimeout(resolve, 1500));
            const data: MangaChapters = await fetchQL(Senkuro.API, undefined, gql, {
                variables: {
                    branchId,
                    after: after,
                    orderBy: {
                        direction: 'ASC',
                        field: 'NUMBER'
                    },
                },
            })
                .then(res => res.mangaChapters);
            
            progressBar.tick(data.edges.length);
            chapters.push(...data.edges);
            
            next = data.pageInfo.hasNextPage;
            after = data.pageInfo.endCursor;
            
            if (Config.max_chapters) {
                if (chapters.length >= Config.max_chapters) {
                    next = false;
                    chapters = chapters.slice(0, Config.max_chapters);
                }
            }
        }
        
        progressBar.terminate();
        
        const branch = {
            list: chapters,
            map: new Map(chapters.map(edge => ([
                edge.node.number,
                edge.node,
            ]))),
        };
        
        this.branches.set(branchId, branch);
        return branch;
    }
    
    async getName() {
        const manga = await this.fetchManga();
        const langPriority = new Map<string, number>([
            ['ru', 1],
            ['en', 2],
            ['ja', 3],
        ]);
        
        const title = manga.titles.sort((a, b) => (
            (langPriority.get(a.lang.toLowerCase()) ?? 999) -
            (langPriority.get(b.lang.toLowerCase()) ?? 999)
        ))[0];
        
        return title.content;
    }
    
    async getShortName() {
        return (await this.getName()).slice(0, 20);
    }
    
    toConnectorNode(node: MangaChapter): ConnectorMangaChapter {
        return {
            chapter: node.number,
            volume: node.volume,
            name: node.name,
            pages: node.pages.map(page => ({
                seq: page.number,
                image: page.image.original.url,
            })),
        };
    }
    
    async getMainChapters() {
        const branch = await this.getPrimaryBranch();
        
        if (!branch)
            throw new Error('Primary branch not found');
        
        const chapters = await this.fetchMangaChapters(branch);
        return chapters.list.map(({ node }) => this.toConnectorNode(node));
    }
    
    async getMainChapter(chapter: string) {
        const branch = await this.getPrimaryBranch();
        
        if (!branch)
            throw new Error('Primary branch not found');
        
        const chapters = await this.fetchMangaChapters(branch);
        const chapterNode = chapters.map.get(chapter);
        
        if (!chapterNode)
            throw new Error('Chapter not found');
        
        return this.toConnectorNode(chapterNode);
    }
    
    async isAccess() {
        return true;
    }
    
    async isAlterChapters() {
        const manga = await this.fetchManga();
        return manga.branches.some(branch => !branch.primaryBranch);
    }
}