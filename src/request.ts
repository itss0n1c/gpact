import { AbortController } from 'abort-controller';
import fetch, { RequestInit, Response } from 'node-fetch';

export const api_url = 'https://api.genshin.dev';

async function request(path: string, queries: Record<string, any> = {}, options: RequestInit = {}, retry_count = 0): Promise<Response> {
	const signal = new AbortController();
	const timeout = setTimeout(() => signal.abort(), 5000);

	const url = new URL(path, api_url);
	for (const [ key, value ] of Object.entries(queries)) {
		url.searchParams.append(key, value);
	}

	let res;
	try {
		res = await fetch(url.toString(), {
			...options,
			signal: signal.signal
		});
	} catch (e) {
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

export async function json<T>(path: string, queries: Record<string, any> = {}, options: RequestInit = {}): Promise<T> {
	const res = await request(path, queries, options);

	return res.json() as Promise<T>;
}
