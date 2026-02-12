import localforage from 'localforage';
import type { StateSynchronizer } from '../types.js';
import { createSyncState } from '../core.svelte.js';

export const lfSynchronizer: StateSynchronizer = {
	read: (key) => localforage.getItem(key),
	write: (key, val) => {
		const result = localforage.setItem(key, val);

		if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
			try {
				const channel = new BroadcastChannel(`lf-sync-${key}`);
				channel.postMessage(val);
				channel.close();
			} catch {
				// BroadcastChannel not available
			}
		}

		return result;
	},

	subscribe: <T>(key: string, write: (newValue: T) => void) => {
		let broadcastChannel: BroadcastChannel | null = null;

		const handleBroadcastMessage = (event: MessageEvent) => {
			write(event.data as T);
		};

		if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
			try {
				broadcastChannel = new BroadcastChannel(`lf-sync-${key}`);
				broadcastChannel.addEventListener('message', handleBroadcastMessage);
			} catch {
				// BroadcastChannel not available
			}
		}

		return () => {
			if (broadcastChannel) {
				broadcastChannel.removeEventListener('message', handleBroadcastMessage);
				broadcastChannel.close();
			}
		};
	}
};

export const lfSync = createSyncState(lfSynchronizer);
