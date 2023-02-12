import { RequestInit } from 'node-fetch';
export declare const api_url = "https://api.genshin.dev";
export declare function json<T>(path: string, queries?: Record<string, any>, options?: RequestInit): Promise<T>;
