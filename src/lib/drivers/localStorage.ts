import { createSyncState } from '$lib/core.svelte.js';
import type { StateSynchronizer } from '../types.js';

export const localStorageSync: StateSynchronizer = {
	read: (key: string) => {
		const raw = localStorage.getItem(key);
		return raw ? JSON.parse(raw) : null;
	},

	write: (key: string, val: unknown) => {
		localStorage.setItem(key, JSON.stringify(val));
	},

	subscribe: <T>(key: string, write: (newValue: T) => void) => {
		const handleStorageChange = (event: StorageEvent) => {
			if (event.key === key && event.newValue !== null) {
				try {
					const newValue = JSON.parse(event.newValue);
					write(newValue as T);
				} catch (error) {
					console.error('Failed to parse storage value:', error);
				}
			}
		};

		window.addEventListener('storage', handleStorageChange);

		return () => {
			window.removeEventListener('storage', handleStorageChange);
		};
	}
};

export const lsSync = createSyncState(localStorageSync);
