// import { multiProgressBar } from './utils/MultiProgress';
import { MultiProgress } from './utils/MultiProgress2';
import { fileURLToPath } from 'url';

import path from 'path';

export interface ConnectorMangaPage {
    seq: number
    image: string
}

export interface ConnectorMangaChapter {
    chapter: string
    volume: string
    name: string
    pages: ConnectorMangaPage[]
}

export interface IConnectorAPI {
    getName(): Promise<string>;
    getShortName(): Promise<string>;
    
    getMainChapters(): Promise<ConnectorMangaChapter[]>;
    getMainChapter(chapter: string): Promise<ConnectorMangaChapter>;
    
    isAccess(): Promise<boolean>;
    isAlterChapters(): Promise<boolean>;
}

function importMetaUrl() {
    return import.meta.url.replace('Connector.ts', '').replace('\\\\', '/').replace('file://', '');
}

export class Connector {
    progressBarSetup(label: string, length: number) {
        return MultiProgress.newBar(`${label}`, {
            type: 'percentage',
            total: length,
        });
    }
    
    static async new(url: string): Promise<Connector & IConnectorAPI> {
        switch (true) {
            case /^https?:..senkuro.(?:com|me)/.test(url): return import(path.join(importMetaUrl(), './connectors/senkuro/index.ts'))  .then(({ Senkuro })   => new Senkuro(url));
            case /^https?:..webfandom.(?:ru)/  .test(url): return import(path.join(importMetaUrl(), './connectors/webfandom/index.ts')).then(({ Webfandom }) => new Webfandom(url));
            
            default: throw new Error('Unknown connector');
        }
    }
}