import { Sema } from 'async-sema';

export default async function concurrencySeries<
    Task,
    TaskResult,
    SerialResult,
    OnCompleteSerial extends ((task_result: TaskResult) => Promise<SerialResult>) | undefined,
    Result extends OnCompleteSerial extends undefined ? TaskResult : SerialResult
>(
    concurrency: number,
    task_list: Task[],
    callback: (task: Task) => Promise<TaskResult>,
    on_complete_serial?: OnCompleteSerial,
) {
    const sem = new Sema(concurrency, { capacity: task_list.length });
    const results: Promise<Result>[] = [];
    let last_promise: Promise<any> = Promise.resolve();
    
    for (const task of task_list) {
        await sem.acquire();
        
        const task_promise = (async (task_result_promise: Promise<TaskResult>, last_promise: Promise<any>): Promise<Result> => {
            if (on_complete_serial === undefined) {
                sem.release();
                return task_result_promise as any;
            };
            
            await last_promise;
            
            const task_result = await task_result_promise;
            const serial_result = await on_complete_serial(task_result);
            
            sem.release();
            return serial_result as any;
        })(callback(task), last_promise);
        
        results.push(task_promise);
        last_promise = task_promise;
    }
    
    return Promise.all(results);
}