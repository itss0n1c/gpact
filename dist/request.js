import { AbortController } from 'abort-controller';
import fetch from 'node-fetch';
export const api_url = 'https://api.genshin.dev';
async function request(path, queries = {}, options = {}, retry_count = 0) {
    const signal = new AbortController();
    const timeout = setTimeout(() => signal.abort(), 5000);
    const url = new URL(path, api_url);
    for (const [key, value] of Object.entries(queries)) {
        url.searchParams.append(key, value);
    }
    // console.log(`[${options.method ?? 'GET'}] ${url.toString()}`);
    let res;
    try {
        res = await fetch(url.toString(), {
            ...options,
            signal: signal.signal
        });
    }
    catch (e) {
        clearTimeout(timeout);
        if (e instanceof Error && e.name === 'AbortError') {
            if (retry_count < 3) {
                return request(path, queries, options, retry_count + 1);
            }
        }
        throw e;
    }
    clearTimeout(timeout);
    return res;
}
export async function json(path, queries = {}, options = {}) {
    const res = await request(path, queries, options);
    // const data = (await res.json()) as Promise<T>;
    // console.log(data);
    // return data;
    return res.json();
}
