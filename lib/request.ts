export const api_url = () => (globalThis as any).GPACT_API_URL ?? import.meta.env.GPACT_API_URL;

async function request(
	path: string,
	queries: Record<string, unknown> = {},
	options: RequestInit = {},
	retry_count = 0,
): Promise<Response> {
	if (!api_url()) {
		throw new Error('GPACT_API_URL is not set');
	}

	const signal = new AbortController();
	const timeout = setTimeout(() => signal.abort(), 5000);

	const url = new URL(path, api_url());
	for (const [key, value] of Object.entries(queries)) {
		url.searchParams.append(key, (value as string).toString());
	}

	let res: Response;
	try {
		res = await fetch(url.toString(), {
			...options,
			signal: signal.signal,
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

export async function json<T>(
	path: string,
	queries: Record<string, unknown> = {},
	options: RequestInit = {},
): Promise<T> {
	const res = await request(path, queries, options);

	return res.json() as Promise<T>;
}
