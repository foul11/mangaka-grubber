// from https://github.com/pitaj/multi-progress
// from https://gist.github.com/nuxlli/b425344b92ac1ff99c74
// with some modifications & additions

// npm install progress
import ProgressBar from 'progress';

const mockBar = {
    tick()      {},
    terminate() {},
    update()    {},
    render()    {},
};

const mockInstance = {
    newBar() {
        return mockBar;
    },
    terminate() {},
    move()      {},
    tick()      {},
    update()    {},
    isTTY: false,
};

interface ProgressBarExtended extends ProgressBar {
    old_tick: typeof ProgressBar.prototype.tick;
    old_terminate: typeof ProgressBar.prototype.terminate;
    old_update: typeof ProgressBar.prototype.update;
}

export class MultiProgress {
    stream: NodeJS.WriteStream;
    isTTY: boolean;
    cursor: number;
    bars: ProgressBarExtended[];
    terminates: number;
    
    constructor(stream?: NodeJS.WriteStream) {
        this.stream = stream || process.stderr;
        this.isTTY = this.stream.isTTY;
        
        this.cursor = 0;
        this.bars = [];
        this.terminates = 0;
        
        return mockInstance as any;
        if (!this.isTTY) {
            return mockInstance as any;
        }
        
        return this;
    }
    
    newBar(schema: string, options: ProgressBar.ProgressBarOptions) {
        options.stream = this.stream;
        
        if (options.width) {
            options.width = Math.min(options.width + options.width - schema.length, this.stream.columns);
        }
        
        let bar = new ProgressBar(schema, options) as any as ProgressBarExtended;
        let index = this.bars.push(bar) - 1;
        
        // alloc line
        this.move(index);
        this.stream.write('\n');
        this.cursor += 1;
        
        // replace original
        bar.old_tick = bar.tick as any;
        bar.old_terminate = bar.terminate;
        bar.old_update = bar.update;
        bar.tick = (value, tokens = undefined) => {
            this.tick(index, value, tokens);
        };
        bar.terminate = () => {
            this.terminates += 1;
            if (this.terminates === this.bars.length) {
                this.terminate();
            }
        };
        bar.update = (value, tokens) => {
            this.update(index, value, tokens);
        };

        return bar;
    }
    
    terminate() {
        this.move(this.bars.length);
        this.stream.clearLine(0);
        this.stream.cursorTo(0);
    }
    
    move(index: number) {
        this.stream.moveCursor(0, index - this.cursor);
        this.cursor = index;
    }
    
    tick(index: number, value?: number, tokens?: any) {
        const bar = this.bars[index];
        
        if (!bar) {
            return;
        }
        
        this.move(index);
        bar.old_tick(value, tokens);
    }
    
    update(index: number, value: number, tokens?: any) {
        const bar = this.bars[index];
        
        if (!bar) {
            return;
        }
        
        this.move(index);
        bar.old_update(value, tokens);
    }
}

export const multiProgressBar = new MultiProgress();