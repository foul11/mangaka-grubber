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
    return decodeURIComponent(import.meta.url.replace('Connector.ts', ''));
}

export class Connector {
    progressBarSetup(label: string, length: number) {
        return MultiProgress.newBar(`${label}`, {
            type: 'percentage',
            total: length,
        });
    }
}