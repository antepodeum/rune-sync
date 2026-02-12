import type { StateSynchronizer } from '../types.js';
import { createSyncState } from '../core.svelte.js';

export interface CookieOptions {
	path?: string;
	domain?: string;
	maxAge?: number;
	expires?: Date;
	sameSite?: 'strict' | 'lax' | 'none';
	secure?: boolean;
}

function serializeOptions(options: CookieOptions): string {
	const parts: string[] = [];
	if (options.path) parts.push(`path=${options.path}`);
	if (options.domain) parts.push(`domain=${options.domain}`);
	if (options.maxAge !== undefined) parts.push(`max-age=${options.maxAge}`);
	if (options.expires) parts.push(`expires=${options.expires.toUTCString()}`);
	if (options.sameSite) parts.push(`SameSite=${options.sameSite}`);
	if (options.secure) parts.push('Secure');
	return parts.join('; ');
}

function getCookie(key: string): string | null {
	const cookies = document.cookie.split('; ');
	for (const cookie of cookies) {
		const eqIndex = cookie.indexOf('=');
		if (eqIndex === -1) continue;
		const name = cookie.slice(0, eqIndex);
		if (name === key) {
			return decodeURIComponent(cookie.slice(eqIndex + 1));
		}
	}
	return null;
}

export function createCookieSynchronizer(options: CookieOptions = {}): StateSynchronizer {
	const resolved: CookieOptions = { path: '/', sameSite: 'lax', ...options };
	const optionString = serializeOptions(resolved);

	return {
		read: (key: string) => {
			const raw = getCookie(key);
			if (!raw) return null;
			try {
				return JSON.parse(raw);
			} catch {
				return null;
			}
		},

		write: (key: string, val: unknown) => {
			const encoded = encodeURIComponent(JSON.stringify(val));
			document.cookie = `${key}=${encoded}; ${optionString}`;

			if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
				try {
					const channel = new BroadcastChannel(`ck-sync-${key}`);
					channel.postMessage(val);
					channel.close();
				} catch {
					// BroadcastChannel not available
				}
			}
		},

		subscribe: <T>(key: string, write: (newValue: T) => void) => {
			let broadcastChannel: BroadcastChannel | null = null;

			if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
				try {
					broadcastChannel = new BroadcastChannel(`ck-sync-${key}`);
					broadcastChannel.addEventListener('message', (event: MessageEvent) => {
						write(event.data as T);
					});
				} catch {
					// BroadcastChannel not available
				}
			}

			return () => {
				if (broadcastChannel) {
					broadcastChannel.close();
				}
			};
		}
	};
}

export function createCookieSync(options: CookieOptions = {}) {
	return createSyncState(createCookieSynchronizer(options));
}

export const cookieSynchronizer = createCookieSynchronizer();
export const ckSync = createSyncState(cookieSynchronizer);
