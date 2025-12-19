import { Config } from '../Config';

export class ErrorRetry extends Error {}

export async function retryOnFailure<T>(cb: (abort: AbortSignal) => Promise<T>, retryCount = 0): Promise<T> {
    try {
        const timeout = AbortSignal.timeout(Config.timeout);
        return await cb(timeout);
    } catch (err) {
        if (!(err instanceof DOMException) &&
            !(err instanceof ErrorRetry) &&
            (err as any)?.code !== 'EAI_AGAIN' &&
            (err as any)?.code !== 'UND_ERR_SOCKET'
        ) {
            throw err;
        }
        
        if (retryCount >= Config.max_retries) {
            throw err;
        }
        
        console.warn(`Timeout, retrying request #${retryCount + 1}`);
        return retryOnFailure(cb, retryCount + 1);
    }
    
    // const AS = AbortSignal.timeout(Config.timeout);
    // return fetch(url, { ...options, signal: AS })
    //     .catch(async err => {
    //         if (!(err instanceof DOMException) && !err?.message?.includes('getaddrinfo EAI_AGAIN')) {
    //             throw err;
    //         }
            
    //         if (retryCount >= 10) {
    //             throw err;
    //         }
            
    //         console.warn('Timeout, retrying request #', retryCount + 1);
    //         return await fetchRetry(url, options, retryCount + 1);
    //     });
}

export async function fetchJSON(url: string | URL, options?: RequestInit) {
    return retryOnFailure(async (abort) => {
        const res = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            signal: abort,
            ...options,
        });
        
        if (!res.ok) {
            throw new Error(await res.text());
        }
        
        return res.json();
    });
}

export async function fetchQL(url: string | URL, operationName: string | undefined, query: string | undefined, options?: Object) {
    return retryOnFailure(async (abort) => {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                operationName,
                query,
                ...options,
            }),
            signal: abort,
        })
            .then(res => res.json());
        
        if (res.errors) {
            throw new Error('\n' + res.errors.map((error: any) => `  - ${error.message}`).join('\n'));
        }
        
        if (!res.data) {
            throw new Error('No data available!');
        }
        
        return res.data;
    });
}