import { MultiProgressBars } from 'multi-progress-bars';
import type { AddOptions } from 'multi-progress-bars';


export class MultiProgress {
    static instance = new MultiProgressBars({
        border: true,
        header: 'Mangaka Grubber',
        persist: true,
    });
    
    task_name: string;
    total: number;
    curr = 0;
    
    constructor(task_name: string, total: number) {
        this.task_name = task_name;
        this.total = total;
    }
    
    static newBar(task: string, options: Omit<AddOptions, 'type'> & { total: number, type?: AddOptions['type'] }) {
        MultiProgress.instance.addTask(task, {
            type: 'percentage',
            ...options,
        });
        return new MultiProgress(task, options.total);
    }
    
    tick(value: number = 1) {
        this.curr += value;
        
        MultiProgress.instance.updateTask(this.task_name, { percentage: this.curr / this.total });
    }
    
    terminate() {
        MultiProgress.instance.done(this.task_name);
    }
}