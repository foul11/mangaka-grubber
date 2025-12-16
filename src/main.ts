import path from 'path';
import yargs from 'yargs';
import sharp from 'sharp';
import PDFDocument from 'pdfkit';
import concurrencySeries from './utils/ConcurrencySeries';

import { mkdirSync, createWriteStream } from 'fs';
import { Readable, Writable } from 'stream';
import { finished } from 'stream/promises';

import { hideBin } from 'yargs/helpers';
import { Connector } from './Connector';
import { MultiProgress } from './utils/MultiProgress2';
import { ErrorRetry, retryOnFailure } from './utils/fetch';
import { Config } from './Config';
import { padLeft } from './utils/mics';

import { Webfandom } from './connectors/webfandom';
import { Senkuro } from './connectors/senkuro';

import type { ConnectorMangaChapter, ConnectorMangaPage, IConnectorAPI } from './Connector';

type IS_URL_INPUT = string | number | (string | number)[];

function isUrl(input: IS_URL_INPUT) {
    if (!Array.isArray(input))
        input = [ input.toString() ];
    
    if (input.length === 0)
        return false;
    
    return input
        .map((arg) => arg.toString())
        .every((arg) => arg.startsWith('http://') || arg.startsWith('https://'));
}

function array_chunk<T>(array: T[], size: number) {
    return Array.from({ length: Math.ceil(array.length / size) }, (v, i) =>
        array.slice(i * size, i * size + size),
    );
}

function chapters_to_path(chapters: ConnectorMangaChapter[]) {
    const first = chapters[0];
    const last = chapters[chapters.length - 1];
    
    if (first === last) {
        return `глава ${padLeft(first.chapter, '0', Config.pad_left_chapter)}`;
    }
    
    return `главы ${padLeft(first.chapter, '0', Config.pad_left_chapter)} - ${padLeft(last.chapter, '0', Config.pad_left_chapter)}`;
}

function chapter_to_path(chapter: ConnectorMangaChapter) {
    const chapter_seq = `том ${padLeft(chapter.volume, '0', Config.pad_left_volume)}. глава ${padLeft(chapter.chapter, '0', Config.pad_left_chapter)}`;
    const chapter_name = Config.save_chapter_name ? `${chapter_seq}${Boolean(chapter.name) ? `. - ${chapter.name}` : ''}` : chapter_seq;
    
    return chapter_name;
}

function page_to_path(page: ConnectorMangaPage) {
    const ext = path.extname(page.image);
    return page
        .seq
        .toString()
        .padStart(Config.pad_left_page, '0')
    + ext;
}

async function download_page(page: ConnectorMangaPage, cb: (res: Response) => Promise<void>) {
    return retryOnFailure(async () => {
        const res = await fetch(page.image);
        
        if (!res.ok || !res.body) {
            throw new ErrorRetry(`Не удалось скачать изображение: ${res.status} ${res.statusText}`);
        }
        
        await cb(res);
        return true;
    })
        .catch((error) => {
            const error_info = `[${page.seq}] ${page.image} (${error?.message})`;
            
            if (!Config.skip_failed)
                throw new Error(`Failed to download image: ${error_info}`);
            
            console.warn(`Не удалось скачать изображение: ${error_info}, пропускаем...`);
            return false;
        });
}

async function response_to_file(path: string, res: Response) {
    const stream = createWriteStream(path);
    return finished(Readable.fromWeb(res.body as any).pipe(stream));
}

function dev_null() {
    return new (
        class extends Writable {
            _write() {}
        }
    )();
}

function new_connector(url: string): Connector & IConnectorAPI {
        switch (true) {
            case /^https?:..senkuro.(?:com|me)/.test(url): return new Senkuro(url);
            case /^https?:..webfandom.(?:ru)/  .test(url): return new Webfandom(url);
            
            default: throw new Error('Unknown connector');
        }
}

async function main(args: typeof y_args) {
    const url_output_name: [string | null, string][] = [];
    const input_args = args['urls-or-name'] as string[];
    
    if (input_args.length === 0)
        throw new Error('Необходимо указать хотя бы одну ссылку');
    
    const is_name_left = !isUrl(input_args[0]) && isUrl(input_args.slice(1));
    const is_name_right = isUrl(input_args.slice(0, -1)) && !isUrl(input_args[input_args.length - 1]);
    const is_name_for_entries = input_args.length % 2 === 0 && array_chunk(input_args, 2).every((chunk) => isUrl(chunk[0]) && !isUrl(chunk[1]));
    const is_url_only = isUrl(input_args);
    
    switch (true) {
        case is_name_left: {
            const name = input_args[0];
            
            input_args.slice(1).forEach((arg) => {
                url_output_name.push([ name.toString(), arg.toString() ]);
            });
            break
        }
        
        case is_name_right: {
            const name = input_args[input_args.length - 1];
            
            input_args.slice(0, -1).forEach((arg) => {
                url_output_name.push([ name.toString(), arg.toString() ]);
            });
            break;
        }
        
        case is_name_for_entries: {
            array_chunk(input_args, 2)
                .forEach((arg) => {
                    url_output_name.push([ arg[0].toString(), arg[1].toString() ]);
                });
            break;
        }
        
        case is_url_only: {
            input_args.forEach((arg) => {
                url_output_name.push([ null, arg.toString() ]);
            });
            break;
        }
        
        default:
            throw new Error('Неверные аргументы');
    }
    
    if (is_name_left || is_name_right) {
        const name = url_output_name[0][0]!;
        
        mkdirSync(path.join(args['output-dir'], name), {
            recursive: true
        });
    }
    
    Config.max_retries = args['max-retries'];
    Config.timeout = args['timeout'];
    Config.pad_left_chapter = args['chapter-pad-left'];
    Config.save_chapter_name = args['save-chapter-name'];
    Config.skip_failed = args['skip-failed'];
    Config.max_chapters = args['max-chapters'];
    
    MultiProgress.init();
    
    const bar_total = MultiProgress.newBar(`total`, {
        total: url_output_name.length,
    });
    
    for (const [ name, url ] of url_output_name) {
        const connector = new_connector(url);
        const manga_name = await connector.getName();
        const output_dir = name
            ? path.join(args['output-dir'], name)
            : path.join(args['output-dir'], manga_name);
            
        if (!await connector.isAccess()) {
            bar_total.tick(1);
            console.warn(`${manga_name} - Требует авторизации, пропускаем`);
            
            continue;
        }
        
        if (is_name_for_entries || is_url_only) {
            mkdirSync(output_dir, {
                recursive: true
            });
        }
        
        const chapters = await connector.getMainChapters();
        const bar_page = MultiProgress.newBar(`Загрузка манги [${manga_name}]`, {
            total: chapters.reduce((acc, chapter) => acc + chapter.pages.length, 0),
        });
        
        if (args['pdf']) {
            const chunk_chapters = array_chunk(chapters, args['pdf-count-chapters']);
            
            for (const chunk of chunk_chapters) {
                const doc = new PDFDocument({
                    autoFirstPage: false,
                });
                
                const output_path = path.join(output_dir, chapters_to_path(chunk) + '.pdf');
                const stream = doc.pipe(createWriteStream(output_path));
                
                for (const chapter of chunk) {
                    await concurrencySeries(args['concurrency'], chapter.pages,
                        async (page) => {
                            return new Promise<ArrayBuffer>((resolve, reject) => {
                                download_page(page, async (res) => resolve(res.arrayBuffer()));
                            });
                        },
                        async (image) => {
                            const sharp_image = sharp(image);
                            const { width, height, format } = await sharp_image.metadata();
                            
                            if (format !== 'png' && format !== 'jpeg' && format !== 'jpg') {
                                image = (await sharp_image.png().toBuffer()).buffer as ArrayBuffer;
                            }
                            
                            doc.addPage({
                                margin: 0,
                                size: [ width, height ]
                            });
                            
                            doc.image(image, 0, 0, { width })
                            bar_page.tick(1);
                        }
                    );
                }
                
                doc.end();
                await finished(stream);
            }
        } else {
            await concurrencySeries(args['concurrency'], chapters,
                async (chapter) => {
                    const chapter_output_dir = path.join(output_dir, chapter_to_path(chapter));
                    
                    mkdirSync(chapter_output_dir, {
                        recursive: true
                    });
                    
                    for (const page of chapter.pages) {
                        await download_page(page, (res) => response_to_file(path.join(chapter_output_dir, page_to_path(page)), res));
                        bar_page?.tick();
                    }
                }
            );
        }
        
        bar_page?.terminate();
        bar_total.tick();
    }
}

const y_args = await yargs(hideBin(process.argv))
    .option('output-dir', {
        alias: 'o',
        type: 'string',
        description: 'Директория куда сохраняется скаченный контент',
        default: process.cwd(),
    })
    .option('save-chapter-name', {
        alias: 'n',
        type: 'boolean',
        description: 'Сохранять название главы',
        default: true,
    })
    .option('skip-failed', {
        alias: 's',
        type: 'boolean',
        description: 'Пропустить изображения которые не удалось скачать',
        default: true,
    })
    .option('concurrency', {
        alias: 'j',
        type: 'number',
        description: 'Количество параллельных потоков скачивания',
        default: 10,
    })
    .option('max-retries', {
        alias: 'r',
        type: 'number',
        description: 'Количество повторных попыток скачивания/обращения к api',
        default: 3,
    })
    .option('timeout', {
        alias: 't',
        type: 'number',
        description: 'Таймаут от api в миллисекундах',
        default: 5000,
    })
    .option('chapter-pad-left', {
        alias: 'l',
        type: 'number',
        description: 'Количество нулей в начале номера главы/тома (для правильной сортировки)',
        default: 4,
    })
    .option('pdf', {
        type: 'boolean',
        description: 'Сохранить главы в pdf',
        default: false,
    })
    .option('pdf-count-chapters', {
        type: 'number',
        description: 'Количество глав в одном pdf-файле',
        default: 1,
    })
    .option('max-chapters', {
        type: 'number',
        description: 'Скачать max-chapters глав',
        default: null,
    })
    .command('$0 <urls-or-name...>', 'Ссылки для скачивания/название директории для скачивания',
        (yargs) => yargs
            .check((argv) => {
                if (!(argv['urls-or-name'] as any).length) {
                    throw new Error('Error: Не указано ни одной ссылки для загрузки');
                }
                
                return true;
            }),
        async (argv) => {
            await main(argv);
        }
    )
    .strict()
    .parseAsync();
