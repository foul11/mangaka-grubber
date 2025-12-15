import { Sema } from 'async-sema';

import { Connector } from '../../Connector';
import { fetchJSON } from '../../utils/fetch';
import { Config } from '../../Config';

import type { Root as Manga } from './types/catalog_publication';
import type { Root as Chapters } from './types/publications';
import type { Root as Pages } from './types/publication_chapters';
import type { ConnectorMangaChapter, IConnectorAPI } from '../../Connector';

interface ObjChapters {
    list: Chapters['results']
    map: Map<string, Chapters['results'][number]>
}

export class Webfandom extends Connector implements IConnectorAPI {
    protected static API = 'https://webfandom.ru/api/v1';
    protected pages: Map<string, Pages> = new Map();
    protected chapters: ObjChapters | undefined;
    protected manga: Manga | undefined;
    protected url: string;
    
    constructor(url: string) {
        super();
        
        this.url = url;
    }
    
    parseSlugFromUrl() {
        const slug = this.url.match(/\/publications\/([^\/]*)/)?.[1];
        
        if (!slug)
            throw new Error('Failed to extract slug from URL');
        
        return slug;
    }
    
    async fetchManga() {
        if (this.manga) {
            return this.manga;
        }
        
        const slug = this.parseSlugFromUrl();
        const data = await fetchJSON(new URL(`catalog/publications/${slug}`, `${Webfandom.API}/`));
        
        console.log('Fetched manga by slug', slug);
        
        this.manga = data;
        return this.manga!;
    }
    
    async fetchMangaChapters() {
        if (this.chapters) {
            return this.chapters;
        }
        
        const slug = this.parseSlugFromUrl();
        const data = (
            await fetchJSON(new URL(`catalog/publications/${slug}/chapters/?limit=100000`, `${Webfandom.API}/`)) as Chapters
        );
        
        for (const chapter of data.results) {
            chapter.volume = chapter.volume.toString();
            chapter.chapter = chapter.chapter.toString();
        }
        
        let chapters = data.results.reverse();
        
        if (Config.max_chapters) {
            chapters = chapters.slice(0, Config.max_chapters);
        }
        
        this.chapters = {
            list: chapters,
            map: new Map(chapters.map(chapter => [
                chapter.chapter,
                chapter,
            ])),
        };
        
        return this.chapters;
    }
    
    async fetchPages(chapter_slug: string) {
        if (!chapter_slug)
            throw new Error('Chapter slug is empty');
        
        if (this.pages.has(chapter_slug)) {
            return this.pages.get(chapter_slug)!;
        }
        
        const data = (
            await fetchJSON(new URL(`catalog/publication_chapters/${chapter_slug}/`, `${Webfandom.API}/`)) as Pages
        );
        
        data.volume = data.volume.toString();
        data.chapter = data.chapter.toString();
        
        this.pages.set(chapter_slug, data);
        return data;
    }
    
    async getName() {
        const manga = await this.fetchManga();
        return manga.name;
    }
    
    async getShortName() {
        return (await this.getName()).slice(0, 20);
    }
    
    toConnectorNode(node: Pages): ConnectorMangaChapter {
        return {
            chapter: node.chapter,
            volume: node.volume,
            name: node.name,
            pages: node.content.map(page => ({
                seq: page.number,
                image: new URL(page.image, Webfandom.API).toString(),
            })),
        };
    }
    
    async getMainChapters() {
        const short_name = await this.getShortName();
        const chapters = (await this.fetchMangaChapters()).list;
        const result: ConnectorMangaChapter[] = [];
        const sem = new Sema(10);
        const bar = this.progressBarSetup(`Получение глав [${short_name}]`, chapters.length);
        
        await Promise.all(
            chapters.map(async (chapter) => {
                await sem.acquire();
                
                const pages = await this.fetchPages(chapter.slug);
                result.push(this.toConnectorNode(pages));
                bar.tick();
                sem.release();
            })
        );
        
        bar.terminate();
        return result.sort((a, b) => Number(a.chapter) - Number(b.chapter));
    }
    
    async getMainChapter(chapter: string) {
        const chapter_slug = (
            await this.fetchMangaChapters()
        )
            .map
            .get(chapter)
            ?.chapter;
        
        if (!chapter_slug)
            throw new Error('Chapter not found');
        
        const pages = await this.fetchPages(chapter_slug);
        return this.toConnectorNode(pages);
    }
    
    async isAccess() {
        const manga = await this.fetchManga();
        
        if (manga.is_porno)
            return false;
        
        return true;
    }
    
    async isAlterChapters() {
        return false;
    }
}