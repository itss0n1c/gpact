/// <reference types="bun-types" resolution-mode="require"/>
/// <reference types="node" resolution-mode="require"/>
export declare const api_url: () => string | undefined;
export declare function json<T>(path: string, queries?: Record<string, unknown>, options?: RequestInit): Promise<T>;
